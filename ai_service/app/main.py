"""AI service: ingests saved content and answers questions about it.

Generalized from the original YouTube-only /process + /ask into per-content,
per-user endpoints backed by app.store instead of a single global dict.
"""
from __future__ import annotations

from pathlib import Path

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app import store
from app.auth import get_user_id
from app.config import ALLOWED_ORIGINS, MAX_UPLOAD_MB, UPLOADS_DIR
from app.loaders import LoaderError, SUPPORTED_TYPES, detect_type, load_source, normalize_type
from app.rag.chunker import chunk_segments
from app.rag.embedder import embed, embed_query
from app.rag.llm import ask_llm
from app.rag.retriever import build_index, retrieve

app = FastAPI(title="Second Brain AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "Second Brain AI service is running"}


@app.get("/content/types")
def supported_types():
    """Lets the frontend know which source types can be indexed for Q&A today."""
    return {"supported": sorted(SUPPORTED_TYPES)}


# --------------------------------------------------------------------------
# Ingestion
# --------------------------------------------------------------------------

def _run_ingestion(user_id: int, content_id: int, kind: str, url: str | None, path: Path | None) -> None:
    try:
        store.write_status(user_id, content_id, store.Status(status="processing"))

        document = load_source(kind, url=url, path=path)

        if not document.text.strip():
            raise LoaderError("No usable text was found in that content.")

        chash = store.content_hash(document.text)
        existing = store.read_status(user_id, content_id)
        if existing and existing.content_hash == chash and existing.status == "done":
            return  # unchanged since last run — skip re-embedding

        chunks = chunk_segments(document.segments)
        if not chunks:
            raise LoaderError("Could not split this content into chunks.")

        texts = [c[0] for c in chunks]
        vectors = embed(texts)

        store.save_index(user_id, content_id, chunks, vectors)
        store.write_status(
            user_id, content_id,
            store.Status(status="done", chunk_count=len(chunks), content_hash=chash),
        )

    except LoaderError as e:
        store.write_status(user_id, content_id, store.Status(status="failed", error=str(e)))
    except Exception as e:  # noqa: BLE001 — surface *something* rather than hang at "processing"
        print(f"INGEST ERROR (user={user_id}, content={content_id}): {e!r}")
        store.write_status(
            user_id, content_id,
            store.Status(status="failed", error="Something went wrong while processing this content."),
        )
    finally:
        if path and path.exists():
            path.unlink(missing_ok=True)


class ProcessRequest(BaseModel):
    content_id: int
    url: str
    type: str | None = None  # auto-detected from the URL if omitted


@app.post("/content/process")
def process_url(
    request: ProcessRequest,
    background_tasks: BackgroundTasks,
    user_id: int = Depends(get_user_id),
):
    url = request.url.strip()
    if not url:
        raise HTTPException(400, "A link is required.")

    kind = normalize_type(request.type) if request.type else detect_type(url=url)
    if kind not in SUPPORTED_TYPES:
        raise HTTPException(
            422,
            f"'{kind}' links are saved, but AI Q&A for that source isn't available yet.",
        )

    store.write_status(user_id, request.content_id, store.Status(status="pending"))
    background_tasks.add_task(_run_ingestion, user_id, request.content_id, kind, url, None)

    return {"status": "pending", "content_id": request.content_id, "type": kind}


@app.post("/content/{content_id}/upload")
async def process_upload(
    content_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile,
    user_id: int = Depends(get_user_id),
):
    # Wrapped in try/except so an unexpected error always comes back as a
    # readable "detail" message in the response, instead of a bare 500 with
    # nothing in the terminal (e.g. when uvicorn's log level hides it).
    try:
        kind = detect_type(filename=file.filename)
        if kind not in SUPPORTED_TYPES:
            raise HTTPException(422, f"'{kind}' files aren't supported for Q&A yet.")

        data = await file.read()
        if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
            raise HTTPException(413, f"File is larger than the {MAX_UPLOAD_MB}MB limit.")

        upload_dir = UPLOADS_DIR / str(user_id)
        upload_dir.mkdir(parents=True, exist_ok=True)
        dest = upload_dir / f"{content_id}_{file.filename}"
        dest.write_bytes(data)

        store.write_status(user_id, content_id, store.Status(status="pending"))
        background_tasks.add_task(_run_ingestion, user_id, content_id, kind, None, dest)

        return {"status": "pending", "content_id": content_id, "type": kind}

    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        print(f"UPLOAD ERROR (user={user_id}, content={content_id}): {e!r}")
        raise HTTPException(500, f"Upload failed: {e}")


@app.get("/content/{content_id}/status")
def get_status(content_id: int, user_id: int = Depends(get_user_id)):
    status = store.read_status(user_id, content_id)
    if status is None:
        raise HTTPException(404, "This content hasn't been processed yet.")
    return status


@app.delete("/content/{content_id}")
def delete_content(content_id: int, user_id: int = Depends(get_user_id)):
    store.delete_content(user_id, content_id)
    return {"status": "deleted"}


# --------------------------------------------------------------------------
# Q&A
# --------------------------------------------------------------------------

class AskRequest(BaseModel):
    content_id: int
    question: str


@app.post("/ask")
def ask(request: AskRequest, user_id: int = Depends(get_user_id)):
    question = request.question.strip()
    if not question:
        raise HTTPException(400, "Question cannot be empty.")

    status = store.read_status(user_id, request.content_id)
    if status is None or status.status != "done":
        raise HTTPException(400, "Please process this content before asking a question.")

    loaded = store.load_index(user_id, request.content_id)
    if loaded is None:
        raise HTTPException(404, "No indexed content found. Try processing it again.")

    texts, locations, vectors = loaded
    index = build_index(vectors)
    results = retrieve(embed_query(question), index, texts, k=3)

    if not results:
        return {"answer": "I couldn't find anything relevant in this content."}

    context = "\n\n".join(results)

    try:
        answer = ask_llm(context, question)
    except RuntimeError as e:
        raise HTTPException(502, str(e))

    return {"answer": answer, "sources": [loc for loc in locations if loc][:3]}

from fastapi import FastAPI
from app.yt.downloader import download_captions
from app.yt.parser import vtt_to_text
from app.rag.chunker import chunk_text
from app.rag.embedder import embed, model
from app.rag.retriever import build_index, retrieve
from app.rag.ollama import ask_ollama
from app.config import CAPTIONS_DIR

app = FastAPI()

STATE = {}

@app.post("/process")
def process(video_url: str, video_id: str):
    download_captions(video_url, video_id)

    vtt = CAPTIONS_DIR / f"{video_id}.en.vtt"
    text = vtt_to_text(vtt)
    chunks = chunk_text(text)
    embeddings = embed(chunks)
    index = build_index(embeddings)

    STATE["chunks"] = chunks
    STATE["index"] = index

    return {"status": "indexed", "chunks": len(chunks)}

@app.post("/ask")
def ask(question: str):
    results = retrieve(question, model, STATE["index"], STATE["chunks"])
    context = "\n".join(results)
    answer = ask_ollama(context, question)
    return {"answer": answer}
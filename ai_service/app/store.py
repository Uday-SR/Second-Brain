"""Per-content, per-user persistence.

Replaces the old global `STATE` dict in main.py, which held only the single most
recently processed video, shared across every user, and lost on restart.

Each content item gets its own folder under INDEX_DIR:

    data/indexes/<user_id>/<content_id>/
        status.json   -> {status, error, chunk_count, content_hash}
        chunks.json   -> [{"text": ..., "location": ...}, ...]
        vectors.npy   -> embeddings, float32, shape (n_chunks, dim)

This is plain-file storage rather than a database so the AI service has no extra
infra dependency. If you outgrow it, swap this module for pgvector (same DB the
Node backend already uses) or Chroma without touching main.py.
"""
from __future__ import annotations

import hashlib
import json
import threading
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np

from app.config import INDEX_DIR

_lock = threading.Lock()  # guards concurrent writes to the same content's files


def _dir(user_id: int, content_id: int) -> Path:
    return INDEX_DIR / str(user_id) / str(content_id)


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


@dataclass
class Status:
    status: str  # pending | processing | done | failed
    error: str | None = None
    chunk_count: int = 0
    content_hash: str | None = None


def read_status(user_id: int, content_id: int) -> Status | None:
    path = _dir(user_id, content_id) / "status.json"
    if not path.exists():
        return None
    return Status(**json.loads(path.read_text()))


def write_status(user_id: int, content_id: int, status: Status) -> None:
    folder = _dir(user_id, content_id)
    folder.mkdir(parents=True, exist_ok=True)
    with _lock:
        (folder / "status.json").write_text(json.dumps(asdict(status)))


def save_index(user_id: int, content_id: int, chunks: list[tuple[str, str | None]], vectors: np.ndarray) -> None:
    folder = _dir(user_id, content_id)
    folder.mkdir(parents=True, exist_ok=True)
    payload = [{"text": text, "location": loc} for text, loc in chunks]
    with _lock:
        (folder / "chunks.json").write_text(json.dumps(payload))
        np.save(folder / "vectors.npy", np.asarray(vectors, dtype="float32"))


def load_index(user_id: int, content_id: int) -> tuple[list[str], list[str | None], np.ndarray] | None:
    folder = _dir(user_id, content_id)
    chunks_path, vectors_path = folder / "chunks.json", folder / "vectors.npy"
    if not (chunks_path.exists() and vectors_path.exists()):
        return None

    payload = json.loads(chunks_path.read_text())
    texts = [p["text"] for p in payload]
    locations = [p.get("location") for p in payload]
    vectors = np.load(vectors_path)
    return texts, locations, vectors


def delete_content(user_id: int, content_id: int) -> None:
    import shutil

    folder = _dir(user_id, content_id)
    if folder.exists():
        with _lock:
            shutil.rmtree(folder, ignore_errors=True)

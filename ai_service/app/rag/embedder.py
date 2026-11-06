from __future__ import annotations

from functools import lru_cache


@lru_cache(maxsize=1)
def get_model():
    
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer("all-MiniLM-L6-v2")


def embed(chunks: list[str]):
    return get_model().encode(chunks, normalize_embeddings=True)


def embed_query(question: str):
    return get_model().encode([question], normalize_embeddings=True)

from __future__ import annotations

import faiss
import numpy as np


def build_index(embeddings: np.ndarray) -> faiss.Index:
    
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(np.asarray(embeddings, dtype="float32"))
    return index


def retrieve(query_embedding, index: faiss.Index, chunks: list[str], k: int = 3) -> list[str]:
    if index.ntotal == 0:
        return []

    k = min(k, index.ntotal)
    scores, ids = index.search(np.asarray(query_embedding, dtype="float32"), k)

    return [chunks[i] for i in ids[0] if i != -1]

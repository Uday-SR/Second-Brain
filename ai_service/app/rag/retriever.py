import faiss
import numpy as np

def build_index(embeddings):
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))
    return index

def retrieve(question, model, index, chunks, k=3):
    q_emb = model.encode([question])
    _, ids = index.search(q_emb, k)
    return [chunks[i] for i in ids[0]]
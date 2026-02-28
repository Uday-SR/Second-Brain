import requests

def ask_ollama(context, question, model="mistral"):
    prompt = f"""
Answer ONLY using the context below.
If not found, say "Not found in video".

Context:
{context}

Question:
{question}
"""

    res = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )

    return res.json()["response"]
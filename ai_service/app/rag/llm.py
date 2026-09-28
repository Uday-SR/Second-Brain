from __future__ import annotations

import requests

from app.config import OLLAMA_API_KEY, OLLAMA_HOST, OLLAMA_MODEL

PROMPT_TEMPLATE = """You are answering questions about a piece of saved content \
({source_type}). Answer ONLY using the context below. If the answer isn't in the \
context, say "I couldn't find that in this content."

Context:
{context}

Question:
{question}"""


def ask_llm(context: str, question: str, source_type: str = "content", model: str | None = None) -> str:
    model = model or OLLAMA_MODEL
    prompt = PROMPT_TEMPLATE.format(context=context, question=question, source_type=source_type)

    if OLLAMA_API_KEY:
        # Ollama's hosted (cloud) API — what the project currently uses.
        url = "https://ollama.com/api/generate"
        headers = {"Authorization": f"Bearer {OLLAMA_API_KEY}", "Content-Type": "application/json"}
    else:
        # A local `ollama serve` — no API key needed, nothing leaves the machine.
        url = f"{OLLAMA_HOST.rstrip('/')}/api/generate"
        headers = {"Content-Type": "application/json"}

    try:
        res = requests.post(
            url,
            headers=headers,
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=120,
        )
        res.raise_for_status()
    except requests.RequestException as e:
        raise RuntimeError(f"The AI model didn't respond: {e}") from e

    return res.json()["response"]

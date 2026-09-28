"""Central configuration for the AI service. Everything comes from env vars / .env."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent  # ai_service/
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))

CAPTIONS_DIR = DATA_DIR / "captions"   # yt-dlp subtitle downloads
UPLOADS_DIR = DATA_DIR / "uploads"     # uploaded PDFs / markdown / text, per user + content id
INDEX_DIR = DATA_DIR / "indexes"       # embeddings + chunks, per user + content id

for _d in (CAPTIONS_DIR, UPLOADS_DIR, INDEX_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# Must be the SAME secret the Node backend signs its JWTs with.
JWT_SECRET = os.getenv("JWT_SECRET", "")

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,https://second-brain-frontend-beryl.vercel.app",
    ).split(",")
    if o.strip()
]

# LLM: if OLLAMA_API_KEY is set we use Ollama's hosted API (your current setup),
# otherwise we talk to a local Ollama server at OLLAMA_HOST.
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "25"))

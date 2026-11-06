from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent  # ai_service/
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))

CAPTIONS_DIR = DATA_DIR / "captions"  
UPLOADS_DIR = DATA_DIR / "uploads"     
INDEX_DIR = DATA_DIR / "indexes"       

for _d in (CAPTIONS_DIR, UPLOADS_DIR, INDEX_DIR):
    _d.mkdir(parents=True, exist_ok=True)

JWT_SECRET = os.getenv("JWT_SECRET", "")

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,https://second-brain-frontend-beryl.vercel.app",
    ).split(",")
    if o.strip()
]

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "25"))

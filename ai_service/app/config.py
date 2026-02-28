from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

CAPTIONS_DIR = BASE_DIR / "storage/captions"
TEXT_DIR = BASE_DIR / "storage/text"
INDEX_DIR = BASE_DIR / "storage/indexes"

for d in [CAPTIONS_DIR, TEXT_DIR, INDEX_DIR]:
    d.mkdir(parents=True, exist_ok=True)
from __future__ import annotations

try:
    import nltk
    from nltk.tokenize import sent_tokenize

    try:
        nltk.data.find("tokenizers/punkt_tab")
    except LookupError:
        nltk.download("punkt_tab", quiet=True)

    def _sentences(text: str) -> list[str]:
        return sent_tokenize(text)

except Exception:  # nltk not installed, or download failed (offline box)
    import re

    def _sentences(text: str) -> list[str]:
        return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def _hard_split(sentence: str, max_chars: int) -> list[str]:
    """A single sentence longer than max_chars (code block, long URL, ...) still
    needs to become one or more chunks, so cut it at word boundaries."""
    words = sentence.split(" ")
    pieces, current = [], ""
    for w in words:
        candidate = f"{current} {w}".strip()
        if len(candidate) > max_chars and current:
            pieces.append(current)
            current = w
        else:
            current = candidate
    if current:
        pieces.append(current)
    return pieces


def chunk_text(text: str, max_chars: int = 500) -> list[str]:
    chunks: list[str] = []
    current = ""

    for s in _sentences(text):
        s = s.strip()
        if not s:
            continue

        if len(s) > max_chars:
            if current:
                chunks.append(current)
                current = ""
            chunks.extend(_hard_split(s, max_chars))
            continue

        candidate = f"{current} {s}".strip()
        if len(candidate) <= max_chars:
            current = candidate
        else:
            chunks.append(current)
            current = s

    if current:
        chunks.append(current)

    return chunks


def chunk_segments(segments, max_chars: int = 500):
    """Chunk a list of loaders.base.Segment, keeping each chunk's location.

    Returns a list of (text, location) tuples so retrieval results can say
    "page 3" or "34:10" instead of just a bare snippet.
    """
    out: list[tuple[str, str | None]] = []
    for seg in segments:
        for piece in chunk_text(seg.text, max_chars):
            out.append((piece, seg.location))
    return out

from __future__ import annotations

import re

from .base import Document, LoaderError, Segment

_HEADING = re.compile(r"^#{1,6}\s+(.*\S)\s*$")


def _decode(data: bytes) -> str:
    try:
        return data.decode("utf-8-sig")
    except UnicodeDecodeError:
        return data.decode("latin-1")


def _split_markdown(text: str) -> list[Segment]:
    """Split on headings so answers can point at a section."""
    segments: list[Segment] = []
    heading: str | None = None
    buf: list[str] = []
    in_code = False

    def flush() -> None:
        body = "\n".join(buf).strip()
        if body:
            segments.append(Segment(body, f"section: {heading}" if heading else None))

    for line in text.splitlines():
        if line.strip().startswith("```"):
            in_code = not in_code
        match = None if in_code else _HEADING.match(line)
        if match:
            flush()
            buf.clear()
            heading = match.group(1)
        else:
            buf.append(line)
    flush()
    return segments


def load_text_bytes(data: bytes, markdown: bool = False) -> Document:
    text = _decode(data)
    if not text.strip():
        raise LoaderError("The file is empty.")

    if markdown:
        segments = _split_markdown(text)
        title = next((s.location[9:] for s in segments if s.location), None)
        return Document(segments or [Segment(text)], title=title)

    return Document([Segment(text)])

"""Source loaders.

Every loader turns "something the user saved" into a Document (text + locations).
Chunking, embedding and Q&A never need to know where the text came from, so adding a
new source type only means adding a loader here and registering it in `load_source`.
"""
from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse

from .base import Document, LoaderError, Segment

__all__ = [
    "Document",
    "LoaderError",
    "Segment",
    "FILE_TYPES",
    "SUPPORTED_TYPES",
    "detect_type",
    "normalize_type",
    "load_source",
]

# Types the AI pipeline can index today. The rest are still saved as bookmarks.
SUPPORTED_TYPES = {"youtube", "article", "url", "pdf", "markdown", "text"}
KNOWN_TYPES = SUPPORTED_TYPES | {"twitter", "github", "image", "audio"}

FILE_TYPES = {".pdf": "pdf", ".md": "markdown", ".markdown": "markdown", ".txt": "text"}

_IMAGE_EXT = (".png", ".jpg", ".jpeg", ".gif", ".webp")
_AUDIO_EXT = (".mp3", ".wav", ".m4a", ".ogg", ".flac")


def _host_is(host: str, domain: str) -> bool:
    return host == domain or host.endswith("." + domain)


def detect_type(url: str | None = None, filename: str | None = None) -> str:
    if filename:
        return FILE_TYPES.get(Path(filename).suffix.lower(), "text")

    if not url:
        return "url"

    parsed = urlparse(url.strip())
    host = (parsed.hostname or "").lower().removeprefix("www.")
    path = parsed.path.lower()

    if host == "youtu.be" or _host_is(host, "youtube.com"):
        return "youtube"
    if _host_is(host, "twitter.com") or _host_is(host, "x.com"):
        return "twitter"
    if host == "github.com":
        return "github"
    if path.endswith(".pdf"):
        return "pdf"
    if path.endswith((".md", ".markdown")):
        return "markdown"
    if path.endswith(".txt"):
        return "text"
    if path.endswith(_IMAGE_EXT):
        return "image"
    if path.endswith(_AUDIO_EXT):
        return "audio"
    return "article"


def normalize_type(kind: str | None) -> str:
    """Older rows use 'other'; anything unknown is treated as a generic URL."""
    kind = (kind or "").strip().lower()
    return kind if kind in KNOWN_TYPES else "url"


def load_source(kind: str, url: str | None = None, path: Path | None = None) -> Document:
    kind = normalize_type(kind)

    if kind not in SUPPORTED_TYPES:
        raise LoaderError(f"AI Q&A for '{kind}' sources isn't available yet.")

    if kind == "youtube":
        if not url:
            raise LoaderError("A YouTube link is required.")
        from .youtube import load_youtube

        return load_youtube(url)

    if kind == "pdf":
        from .http import fetch
        from .pdf import load_pdf_bytes

        if path:
            return load_pdf_bytes(path.read_bytes())
        if url:
            return load_pdf_bytes(fetch(url)[0])
        raise LoaderError("A PDF file or link is required.")

    if kind in ("markdown", "text"):
        from .http import fetch
        from .text import load_text_bytes

        is_md = kind == "markdown"
        if path:
            return load_text_bytes(path.read_bytes(), markdown=is_md)
        if url:
            return load_text_bytes(fetch(url)[0], markdown=is_md)
        raise LoaderError("A file or link is required.")

    # article / url
    if not url:
        raise LoaderError("A link is required.")
    from .web import load_url

    return load_url(url)

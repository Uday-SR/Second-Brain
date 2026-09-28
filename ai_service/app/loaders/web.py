from __future__ import annotations

from .base import Document, LoaderError, Segment
from .http import fetch
from .pdf import load_pdf_bytes
from .text import load_text_bytes


def load_url(url: str) -> Document:
    """Fetch a URL and pick the right extractor from what actually comes back."""
    data, content_type, final_url = fetch(url)

    if content_type == "application/pdf" or data[:5] == b"%PDF-":
        return load_pdf_bytes(data)

    if content_type in ("text/plain", "text/markdown"):
        return load_text_bytes(data, markdown=final_url.lower().endswith((".md", ".markdown")))

    import trafilatura

    html = data.decode("utf-8", errors="replace")
    text = trafilatura.extract(
        html,
        url=final_url,
        include_comments=False,
        include_tables=True,
        favor_recall=True,
    )

    if not text or len(text.strip()) < 100:
        raise LoaderError(
            "Couldn't find readable article text on that page. "
            "It may need JavaScript, a login, or be behind a paywall."
        )

    meta = trafilatura.extract_metadata(html, default_url=final_url)
    title = getattr(meta, "title", None) if meta else None
    return Document([Segment(text.strip())], title=title, meta={"url": final_url})

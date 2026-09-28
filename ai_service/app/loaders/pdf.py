from __future__ import annotations

from .base import Document, LoaderError, Segment


def load_pdf_bytes(data: bytes) -> Document:
    import fitz  # PyMuPDF

    try:
        pdf = fitz.open(stream=data, filetype="pdf")
    except Exception:
        raise LoaderError("That file couldn't be opened as a PDF.")

    if pdf.needs_pass:
        raise LoaderError("This PDF is password-protected.")

    segments: list[Segment] = []
    for number, page in enumerate(pdf, start=1):
        text = page.get_text("text").strip()
        if text:
            segments.append(Segment(text, f"page {number}"))

    if not segments:
        raise LoaderError(
            "No text could be extracted. This looks like a scanned PDF; "
            "OCR support isn't available yet."
        )

    title = (pdf.metadata or {}).get("title") or None
    return Document(segments, title=title, meta={"pages": len(pdf)})

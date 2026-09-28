from __future__ import annotations

import re
from urllib.parse import parse_qs, urlparse

from .base import Document, LoaderError, Segment


def extract_video_id(url: str) -> str:
    try:
        parsed = urlparse(url.strip())
    except ValueError:
        return ""

    host = (parsed.hostname or "").lower()

    if host == "youtu.be":
        return parsed.path.lstrip("/").split("/")[0]

    if host == "youtube.com" or host.endswith(".youtube.com"):
        if parsed.path == "/watch":
            return parse_qs(parsed.query).get("v", [""])[0]
        match = re.match(r"^/(?:shorts|embed|live)/([\w-]{6,})", parsed.path)
        if match:
            return match.group(1)

    return ""


def load_youtube(url: str) -> Document:
    from app.config import CAPTIONS_DIR
    from app.yt.downloader import download_captions
    from app.yt.parser import vtt_to_text

    video_id = extract_video_id(url)
    if not video_id:
        raise LoaderError("I couldn't find a YouTube video ID in that link.")

    try:
        download_captions(url, video_id)
    except Exception:
        raise LoaderError("Couldn't download captions for that video.")

    vtt = CAPTIONS_DIR / f"{video_id}.en.vtt"
    if not vtt.exists():
        raise LoaderError("English captions were not found for this video.")

    text = vtt_to_text(vtt)
    if not text.strip():
        raise LoaderError("No usable text was extracted from the video.")

    return Document([Segment(text)], meta={"video_id": video_id})

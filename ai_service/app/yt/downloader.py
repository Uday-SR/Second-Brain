from yt_dlp import YoutubeDL
from pathlib import Path

CAPTIONS_DIR = Path("data/captions")
CAPTIONS_DIR.mkdir(parents=True, exist_ok=True)

def download_captions(video_url: str, video_id: str):
    ydl_opts = {
        "skip_download": True,          # 🚫 no video
        "writesubtitles": True,         # captions
        "writeautomaticsub": True,      # auto captions
        "subtitleslangs": ["en"],
        "subtitlesformat": "vtt",
        "outtmpl": str(CAPTIONS_DIR / f"{video_id}.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])
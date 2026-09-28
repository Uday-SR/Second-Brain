import re


def vtt_to_text(path):
    """Convert a WebVTT caption file to plain text.

    Auto-generated captions repeat each line in the next cue ("rolling" captions),
    so consecutive duplicate lines are dropped.
    """
    out = []
    last = None

    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or "-->" in line or line.startswith(("WEBVTT", "Kind:", "Language:")):
                continue
            line = re.sub(r"<.*?>", "", line).strip()
            if not line or line == last:
                continue
            out.append(line)
            last = line

    return " ".join(out)

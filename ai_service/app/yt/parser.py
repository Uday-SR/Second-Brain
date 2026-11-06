import re

def vtt_to_text(path):
    
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

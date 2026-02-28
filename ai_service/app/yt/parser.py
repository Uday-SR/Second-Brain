import re

def vtt_to_text(path):
    lines = open(path, encoding="utf-8").readlines()
    out = []

    for l in lines:
        l = l.strip()
        if not l or "-->" in l or l.startswith(("WEBVTT", "Kind:", "Language:")):
            continue
        out.append(re.sub(r"<.*?>", "", l))

    return " ".join(out)
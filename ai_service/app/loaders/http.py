"""Safe HTTP fetching for user-supplied URLs.

The AI service downloads whatever URL a user saves, so it must not be tricked into
reaching internal addresses (localhost, cloud metadata endpoints, private networks).
Every hop of a redirect chain is checked. (Note: this does not defend against DNS
rebinding; run the service without access to sensitive internal networks in production.)
"""
from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import requests

from .base import LoaderError

MAX_BYTES = 25 * 1024 * 1024
TIMEOUT_SECONDS = 20
MAX_REDIRECTS = 5
USER_AGENT = "Mozilla/5.0 (compatible; SecondBrainBot/1.0)"


def _assert_public(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise LoaderError("Only http(s) links are supported.")

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    try:
        infos = socket.getaddrinfo(parsed.hostname, port, proto=socket.IPPROTO_TCP)
    except socket.gaierror:
        raise LoaderError("Couldn't resolve that address.")

    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            raise LoaderError("That address isn't allowed.")


def fetch(url: str) -> tuple[bytes, str, str]:
    """Return (body, content_type, final_url)."""
    current = url.strip()

    for _ in range(MAX_REDIRECTS + 1):
        _assert_public(current)
        try:
            resp = requests.get(
                current,
                headers={"User-Agent": USER_AGENT},
                timeout=TIMEOUT_SECONDS,
                stream=True,
                allow_redirects=False,
            )
        except requests.RequestException:
            raise LoaderError("Couldn't download that link.")

        try:
            if resp.status_code in (301, 302, 303, 307, 308):
                location = resp.headers.get("Location")
                if not location:
                    raise LoaderError("The link redirected without a destination.")
                current = urljoin(current, location)
                continue

            if resp.status_code >= 400:
                raise LoaderError(f"The site returned HTTP {resp.status_code}.")

            body = bytearray()
            for part in resp.iter_content(65536):
                body.extend(part)
                if len(body) > MAX_BYTES:
                    raise LoaderError("That page or file is too large (limit 25 MB).")
        except requests.RequestException:
            raise LoaderError("The download was interrupted.")
        finally:
            resp.close()

        content_type = resp.headers.get("Content-Type", "").split(";")[0].strip().lower()
        return bytes(body), content_type, current

    raise LoaderError("Too many redirects.")

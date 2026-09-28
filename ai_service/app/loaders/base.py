from __future__ import annotations

from dataclasses import dataclass, field


class LoaderError(Exception):
    """A problem with the source itself. The message is safe to show to the user."""


@dataclass
class Segment:
    """A piece of text plus where it came from ("page 3", "section: Setup", ...)."""

    text: str
    location: str | None = None


@dataclass
class Document:
    segments: list[Segment]
    title: str | None = None
    meta: dict = field(default_factory=dict)

    @property
    def text(self) -> str:
        return "\n\n".join(s.text for s in self.segments)

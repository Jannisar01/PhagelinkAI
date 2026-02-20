from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Query:
    host_species: str


@dataclass
class Phage:
    id: str
    name: str
    host_species: str
    lifecycle: Optional[str] = None
    source_url: Optional[str] = None


@dataclass
class Reasons:
    positives: list[str] = field(default_factory=list)
    negatives: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def to_json(self) -> dict[str, list[str]]:
        return {
            "positives": self.positives,
            "negatives": self.negatives,
            "notes": self.notes,
        }


@dataclass
class RankedPhage(Phage):
    score: int = 0
    reasons_json: dict[str, list[str]] = field(default_factory=dict)

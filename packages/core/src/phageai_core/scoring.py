from __future__ import annotations

from .models import Phage, Query, RankedPhage, Reasons


def _genus(species: str) -> str:
    return species.strip().split()[0].lower() if species.strip() else ""


def rank_phages(query: Query, candidates: list[Phage]) -> list[RankedPhage]:
    query_species = query.host_species.strip().lower()
    query_genus = _genus(query.host_species)

    ranked: list[RankedPhage] = []

    for c in candidates:
        score = 0
        reasons = Reasons()
        candidate_species = c.host_species.strip().lower()

        if candidate_species == query_species:
            score += 40
            reasons.positives.append("Exact host species match (+40)")
        elif _genus(c.host_species) == query_genus:
            score += 20
            reasons.positives.append("Host genus match (+20)")
        else:
            reasons.notes.append("No host match bonus")

        if c.lifecycle is None or c.lifecycle.strip() == "":
            score -= 10
            reasons.negatives.append("Missing lifecycle (-10)")
        elif c.lifecycle.strip().lower() == "lytic":
            score += 25
            reasons.positives.append("Lytic lifecycle (+25)")
        else:
            reasons.notes.append("Lifecycle provided but not lytic")

        if c.source_url:
            score += 10
            reasons.positives.append("Has source URL (+10)")

        ranked.append(
            RankedPhage(
                id=c.id,
                name=c.name,
                host_species=c.host_species,
                lifecycle=c.lifecycle,
                source_url=c.source_url,
                score=score,
                reasons_json=reasons.to_json(),
            )
        )

    return sorted(ranked, key=lambda p: p.score, reverse=True)

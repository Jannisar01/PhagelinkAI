"""Stub adapter for future PhageScope integration."""


def fetch_candidates_for_host(host_species: str) -> list[dict]:
    """Return placeholder candidates until real API wiring is added."""
    return [
        {
            "id": "stub-1",
            "name": "PhageScope Stub Candidate",
            "host_species": host_species,
            "lifecycle": "lytic",
            "source_url": None,
        }
    ]

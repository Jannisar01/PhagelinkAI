from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from phageai_core import Phage, Query, rank_phages
from pydantic import BaseModel


class CandidateIn(BaseModel):
    id: str
    name: str
    host_species: str
    lifecycle: str | None = None
    source_url: str | None = None


class RankRequest(BaseModel):
    host_species: str
    candidates: list[CandidateIn]


app = FastAPI(title="PhageAI Match API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/rank")
def rank(payload: RankRequest) -> list[dict]:
    ranked = rank_phages(
        Query(host_species=payload.host_species),
        [Phage(**candidate.model_dump()) for candidate in payload.candidates],
    )
    return [
        {
            "id": phage.id,
            "name": phage.name,
            "host_species": phage.host_species,
            "lifecycle": phage.lifecycle,
            "source_url": phage.source_url,
            "score": phage.score,
            "reasons_json": phage.reasons_json,
        }
        for phage in ranked
    ]

from phageai_core.models import Phage, Query
from phageai_core.scoring import rank_phages


def test_exact_match_scores_above_genus_match() -> None:
    query = Query(host_species="Escherichia coli")
    candidates = [
        Phage(id="1", name="Exact", host_species="Escherichia coli"),
        Phage(id="2", name="Genus", host_species="Escherichia albertii"),
    ]

    ranked = rank_phages(query, candidates)
    assert ranked[0].id == "1"
    assert ranked[0].score > ranked[1].score


def test_lytic_adds_points() -> None:
    query = Query(host_species="Bacillus subtilis")
    candidates = [
        Phage(id="1", name="Lytic", host_species="Bacillus subtilis", lifecycle="lytic"),
        Phage(id="2", name="Temperate", host_species="Bacillus subtilis", lifecycle="temperate"),
    ]

    ranked = rank_phages(query, candidates)
    lytic = next(p for p in ranked if p.id == "1")
    temperate = next(p for p in ranked if p.id == "2")
    assert lytic.score == temperate.score + 25


def test_missing_lifecycle_penalized() -> None:
    query = Query(host_species="Pseudomonas aeruginosa")
    candidates = [
        Phage(id="1", name="Missing", host_species="Pseudomonas aeruginosa", lifecycle=None),
    ]

    ranked = rank_phages(query, candidates)
    assert ranked[0].score == 30
    assert "Missing lifecycle (-10)" in ranked[0].reasons_json["negatives"]

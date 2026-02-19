#!/usr/bin/env python3
"""Convert RefSeq PhageScope metadata (TSV/CSV) into canonical JSON for the web app."""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from pathlib import Path
from typing import Any

DEFAULT_INPUT = Path("data/raw/refseq_phage_meta_data.tsv")
DEFAULT_OUTPUT = Path("apps/web/public/data/phagescope.json")


def detect_delimiter(path: Path) -> str:
    sample = path.read_text(encoding="utf-8", errors="ignore")[:8192]
    if not sample.strip():
        return "\t"

    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t;")
        return dialect.delimiter
    except csv.Error:
        first_line = sample.splitlines()[0] if sample.splitlines() else ""
        if first_line.count("\t") >= first_line.count(","):
            return "\t"
        return ","


def to_float(value: str | None) -> float | None:
    if value is None:
        return None
    text = value.strip()
    if not text:
        return None
    text = text.replace(",", "")
    if text.endswith("%"):
        text = text[:-1]
    try:
        return float(text)
    except ValueError:
        return None


def normalize_lifecycle(value: str | None) -> str | None:
    if not value:
        return None
    lowered = value.strip().lower()
    if lowered in {"virulent", "lytic"}:
        return "lytic"
    if lowered in {"temperate", "lysogenic"}:
        return "temperate"
    return None


def transform_row(row: dict[str, str]) -> dict[str, Any] | None:
    phage_id = (row.get("Phage_ID") or "").strip()
    if not phage_id:
        return None

    host = (row.get("Host") or "").strip() or None
    lifecycle = normalize_lifecycle(row.get("Lifestyle"))

    return {
        "id": phage_id,
        "name": phage_id,
        "host_species": host,
        "lifecycle": lifecycle,
        "source_url": f"https://www.ncbi.nlm.nih.gov/nuccore/{phage_id}",
        "taxonomy": (row.get("Taxonomy") or "").strip() or None,
        "completeness": (row.get("Completeness") or "").strip() or None,
        "length_kb": to_float(row.get("Length")),
        "gc_content": to_float(row.get("GC_content")),
        "cluster": (row.get("Cluster") or "").strip() or None,
        "subcluster": (row.get("Subcluster") or "").strip() or None,
    }


def print_stats(records: list[dict[str, Any]]) -> None:
    total = len(records)
    with_lifecycle = sum(1 for row in records if row.get("lifecycle"))
    with_completeness = sum(1 for row in records if row.get("completeness"))
    hosts = Counter(row["host_species"] for row in records if row.get("host_species"))

    print(f"total records: {total}")
    print("top 10 host_species:")
    for host, count in hosts.most_common(10):
        print(f"  {host}: {count}")

    lifecycle_pct = (with_lifecycle / total * 100) if total else 0
    completeness_pct = (with_completeness / total * 100) if total else 0
    print(f"% with lifecycle: {lifecycle_pct:.2f}%")
    print(f"% with completeness: {completeness_pct:.2f}%")


def convert(input_path: Path, output_path: Path) -> list[dict[str, Any]]:
    delimiter = detect_delimiter(input_path)

    with input_path.open("r", newline="", encoding="utf-8", errors="ignore") as infile:
        reader = csv.DictReader(infile, delimiter=delimiter)
        records: list[dict[str, Any]] = []
        for row in reader:
            transformed = transform_row(row)
            if transformed is not None:
                records.append(transformed)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return records


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "input_path",
        nargs="?",
        default=str(DEFAULT_INPUT),
        help=f"Path to RefSeq PhageScope metadata TSV/CSV (default: {DEFAULT_INPUT})",
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT),
        help=f"Output JSON path (default: {DEFAULT_OUTPUT})",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input_path)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    records = convert(input_path, output_path)
    print(f"wrote: {output_path}")
    print_stats(records)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProvider } from "@/lib/providers";

type Candidate = {
  id: string;
  name: string;
  host_species: string;
  lifecycle?: string | null;
  source_url?: string | null;
};

type RankedPhage = Candidate & {
  score: number;
  reasons_json: {
    positives: string[];
    negatives: string[];
    notes: string[];
  };
};

type PdfExportPayloadItem = {
  id: string;
  name: string;
  host_species: string;
  lifecycle?: string | null;
  source_url?: string | null;
  score: number;
  reasons_json: RankedPhage["reasons_json"];
};

export default function HomePage() {
  const [hostSpecies, setHostSpecies] = useState("Escherichia coli");
  const [results, setResults] = useState<RankedPhage[]>([]);
  const [loading, setLoading] = useState(false);
  const [topN, setTopN] = useState(25);
  const [lyticOnly, setLyticOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [page, setPage] = useState(1);

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
    []
  );

  const runRanking = async () => {
    setLoading(true);
    try {
      const provider = getProvider();
      const candidates = await provider.getCandidates(hostSpecies);

      const response = await fetch(`${apiBaseUrl}/rank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          host_species: hostSpecies,
          candidates: candidates.slice(0, 500)
        })
      });

      if (!response.ok) {
        throw new Error("Failed to rank candidates");
      }

      const data = (await response.json()) as RankedPhage[];
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      if (lyticOnly && item.lifecycle !== "lytic") {
        return false;
      }

      return item.score >= minScore;
    });
  }, [lyticOnly, minScore, results]);

  // Use topN as page size so demo controls are easier to reason about.
  const pageSize = topN;
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [hostSpecies, lyticOnly, minScore, topN, results]);

  const buildCsvLines = (data: RankedPhage[]) => {
    const escapeCell = (value: string) => {
      const escaped = value.replaceAll('"', '""');
      return `"${escaped}"`;
    };

    return [
      [
        "id",
        "name",
        "host_species",
        "lifecycle",
        "score",
        "positives",
        "negatives",
        "source_url"
      ].join(","),
      ...data.map((item) =>
        [
          escapeCell(item.id),
          escapeCell(item.name),
          escapeCell(item.host_species),
          escapeCell(item.lifecycle ?? ""),
          String(item.score),
          escapeCell(item.reasons_json.positives.join("; ")),
          escapeCell(item.reasons_json.negatives.join("; ")),
          escapeCell(item.source_url ?? "")
        ].join(",")
      )
    ];
  };

  const downloadCsv = () => {
    const lines = buildCsvLines(paginatedResults);

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const normalizedHost = hostSpecies.trim().replaceAll(/\s+/g, "_") || "unknown_host";
    anchor.href = url;
    anchor.download = `phageai_ranked_${normalizedHost}_page${currentPage}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const downloadAllFilteredCsv = () => {
    const lines = buildCsvLines(filteredResults);

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const normalizedHost = hostSpecies.trim().replaceAll(/\s+/g, "_") || "unknown_host";
    anchor.href = url;
    anchor.download = `phageai_ranked_${normalizedHost}_ALL.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const downloadAllFilteredPdf = async () => {
    const normalizedHost = hostSpecies.trim().replaceAll(/\s+/g, "_") || "unknown_host";
    const payload = {
      host_species: hostSpecies,
      filters: {
        lyticOnly,
        minScore
      },
      results: filteredResults.map<PdfExportPayloadItem>((item) => ({
        id: item.id,
        name: item.name,
        host_species: item.host_species,
        lifecycle: item.lifecycle,
        source_url: item.source_url,
        score: item.score,
        reasons_json: item.reasons_json
      }))
    };

    const response = await fetch(`${apiBaseUrl}/export/pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Failed to export PDF report");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `phageai_ranked_${normalizedHost}_ALL.pdf`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">PhageAI Match MVP</h1>
      <p className="text-sm text-slate-600">
        RuleSet v1 ranking against PhageScope RefSeq local JSON candidates.
      </p>

      <Card className="space-y-3 p-4">
        <label className="text-sm font-medium" htmlFor="host">
          Host species
        </label>
        <Input
          id="host"
          value={hostSpecies}
          onChange={(e) => setHostSpecies(e.target.value)}
          placeholder="e.g. Escherichia coli"
        />
        <Button onClick={runRanking} disabled={loading || !hostSpecies.trim()}>
          {loading ? "Ranking..." : "Rank phages"}
        </Button>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium" htmlFor="topN">
            Results per page
          </label>
          <select
            id="topN"
            className="rounded border px-3 py-2 text-sm"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">Page size uses the Top N value.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={lyticOnly}
              onChange={(e) => setLyticOnly(e.target.checked)}
            />
            Lytic only
          </label>

          <label className="text-sm font-medium" htmlFor="minScore">
            Min score
          </label>
          <select
            id="minScore"
            className="rounded border px-3 py-2 text-sm"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
          >
            {[0, 25, 50, 75].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            Showing {paginatedResults.length} of {filteredResults.length} filtered results.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadCsv} disabled={paginatedResults.length === 0}>
              Download CSV
            </Button>
            <Button onClick={downloadAllFilteredCsv} disabled={filteredResults.length === 0}>
              Download CSV (All filtered)
            </Button>
            <Button onClick={downloadAllFilteredPdf} disabled={filteredResults.length === 0}>
              Download PDF (All filtered)
            </Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4">
        {paginatedResults.map((item) => (
          <Card className="space-y-2 p-4" key={item.id}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <span className="rounded bg-slate-100 px-2 py-1 text-sm font-medium">
                {item.score}
              </span>
            </div>
            <p className="text-sm text-slate-700">Host: {item.host_species}</p>
            <p className="text-sm text-slate-700">
              Matched factors:{" "}
              {item.reasons_json.positives.join("; ") || "None"}
            </p>
            {item.source_url ? (
              <a
                className="text-sm text-blue-600 underline"
                href={item.source_url}
                target="_blank"
              >
                Access record
              </a>
            ) : null}
          </Card>
        ))}
      </section>

      <div className="flex items-center justify-between">
        <Button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage <= 1}>
          Prev
        </Button>
        <p className="text-sm text-slate-600">
          Page {currentPage} of {totalPages}
        </p>
        <Button
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </main>
  );
}

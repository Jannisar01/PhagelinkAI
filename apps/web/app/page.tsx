"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

const demoCandidates: Candidate[] = [
  {
    id: "p1",
    name: "EcoM-Lytic-1",
    host_species: "Escherichia coli",
    lifecycle: "lytic",
    source_url: "https://example.org/phage/p1"
  },
  {
    id: "p2",
    name: "EcoM-Temperate-2",
    host_species: "Escherichia albertii",
    lifecycle: "temperate"
  },
  {
    id: "p3",
    name: "Pseudo-NoLifecycle-3",
    host_species: "Pseudomonas aeruginosa"
  }
];

export default function HomePage() {
  const [hostSpecies, setHostSpecies] = useState("Escherichia coli");
  const [results, setResults] = useState<RankedPhage[]>([]);
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
    []
  );

  const runRanking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/rank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ host_species: hostSpecies, candidates: demoCandidates })
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

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">PhageAI Match MVP</h1>
      <p className="text-sm text-slate-600">RuleSet v1 demo ranking against sample candidates.</p>

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

      <section className="grid gap-4">
        {results.map((item) => (
          <Card className="space-y-2 p-4" key={item.id}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <span className="rounded bg-slate-100 px-2 py-1 text-sm font-medium">{item.score}</span>
            </div>
            <p className="text-sm text-slate-700">Host: {item.host_species}</p>
            <p className="text-sm text-slate-700">Matched factors: {item.reasons_json.positives.join("; ") || "None"}</p>
            {item.source_url ? (
              <a className="text-sm text-blue-600 underline" href={item.source_url} target="_blank">
                Access record
              </a>
            ) : null}
          </Card>
        ))}
      </section>
    </main>
  );
}

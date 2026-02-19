"use client";

import { FormEvent, useMemo, useState } from "react";
import { getProvider, type PhageCandidate } from "../lib/providers";

type RankResponse = {
  ranked?: PhageCandidate[];
  candidates?: PhageCandidate[];
};

export default function HomePage() {
  const provider = useMemo(() => getProvider(), []);
  const [hostSpecies, setHostSpecies] = useState("");
  const [rankedCandidates, setRankedCandidates] = useState<PhageCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const candidates = await provider.getCandidates(hostSpecies);

      const response = await fetch("/rank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host_species: hostSpecies,
          candidates,
        }),
      });

      if (!response.ok) {
        throw new Error("Ranking request failed.");
      }

      const data = (await response.json()) as RankResponse | PhageCandidate[];
      const ranked = Array.isArray(data)
        ? data
        : data.ranked ?? data.candidates ?? [];

      setRankedCandidates(ranked);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to rank phage candidates.",
      );
      setRankedCandidates([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 880, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>PhageLink Candidate Ranking</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="host-species">Host species</label>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            id="host-species"
            name="host-species"
            value={hostSpecies}
            onChange={(event) => setHostSpecies(event.target.value)}
            placeholder="Escherichia coli"
            style={{ flex: 1, padding: "0.5rem" }}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Ranking..." : "Rank"}
          </button>
        </div>
      </form>

      {error ? (
        <p style={{ color: "crimson", marginTop: "1rem" }} role="alert">
          {error}
        </p>
      ) : null}

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Ranked candidates ({rankedCandidates.length})</h2>
        <ul>
          {rankedCandidates.map((candidate) => (
            <li key={candidate.id}>
              <strong>{candidate.name}</strong> — {candidate.host_species}
              {candidate.lifecycle ? ` (${candidate.lifecycle})` : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

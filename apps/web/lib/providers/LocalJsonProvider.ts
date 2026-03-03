import type { PhageCandidate, PhageProvider } from "./PhageProvider";

export class LocalJsonProvider implements PhageProvider {
  async getCandidates(hostSpecies: string): Promise<PhageCandidate[]> {
    let response = await fetch("/data/phagescope.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      response = await fetch("/data/phages.sample.json", {
        cache: "no-store"
      });
    }

    if (!response.ok) {
      throw new Error("Failed to load local phage dataset.");
    }

    const records = (await response.json()) as PhageCandidate[];
    const normalized = hostSpecies.trim().toLowerCase();

    if (!normalized) {
      return records;
    }

    return records.filter((record) =>
      record.host_species.toLowerCase().includes(normalized)
    );
  }
}

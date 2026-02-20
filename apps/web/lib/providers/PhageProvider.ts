export interface PhageCandidate {
  id: string;
  name: string;
  host_species: string;
  lifecycle?: "lytic" | "temperate";
  source_url?: string;
}

export interface PhageProvider {
  getCandidates(hostSpecies: string): Promise<PhageCandidate[]>;
}

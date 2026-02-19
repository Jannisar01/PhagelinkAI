export type Candidate = {
  id: string;
  name: string;
  host_species: string;
  lifecycle?: string | null;
  source_url?: string | null;
};

export type RankRequest = {
  host_species: string;
  candidates: Candidate[];
};

export type RankedPhage = Candidate & {
  score: number;
  reasons_json: {
    positives: string[];
    negatives: string[];
    notes: string[];
  };
};

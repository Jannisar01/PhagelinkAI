export type PhageProteinSignals = {
  total_proteins: number;
  anti_crispr_hits: number;
  amr_hits: number;
  virulence_hits: number;
  transmembrane_hits: number;
  integrase_hits: number;
};

const antiCrisprKeywords = [
  "anti-crispr",
  "anti crispr",
  "acr",
  "crisper inhibitor",
  "crisp r inhibitor"
];

const amrKeywords = [
  "resistance",
  "antimicrobial",
  "antibiotic",
  "beta-lactamase",
  "betalactamase",
  "mcr",
  "tet",
  "erm",
  "van",
  "aac",
  "aph"
];

const virulenceKeywords = [
  "virulence",
  "toxin",
  "hemolysin",
  "adhesin",
  "invasin",
  "pathogenic"
];

const transmembraneKeywords = [
  "transmembrane",
  "membrane protein",
  "tm domain",
  "signal peptide"
];

const integraseKeywords = [
  "integrase",
  "recombinase",
  "excisionase",
  "repressor",
  "lysogen",
  "prophage"
];

const hasAnyKeyword = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

const defaultSignals = (): PhageProteinSignals => ({
  total_proteins: 0,
  anti_crispr_hits: 0,
  amr_hits: 0,
  virulence_hits: 0,
  transmembrane_hits: 0,
  integrase_hits: 0
});

const parseTsv = (tsv: string) => {
  const lines = tsv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [] as string[][];
  }

  const headers = lines[0].split("\t");
  const headerIndex = new Map(headers.map((header, index) => [header, index]));

  const phageIdIndex = headerIndex.get("Phage_ID");
  const productIndex = headerIndex.get("Product");
  const classificationIndex = headerIndex.get("Protein_classification");
  const predictionSourceIndex = headerIndex.get("Function_prediction_source");

  if (
    phageIdIndex === undefined ||
    productIndex === undefined ||
    classificationIndex === undefined ||
    predictionSourceIndex === undefined
  ) {
    return [] as string[][];
  }

  return lines.slice(1).map((line) => {
    const columns = line.split("\t");
    return [
      columns[phageIdIndex] ?? "",
      columns[productIndex] ?? "",
      columns[classificationIndex] ?? "",
      columns[predictionSourceIndex] ?? ""
    ];
  });
};

export const getAnnotatedProteinSignals = async (): Promise<
  Record<string, PhageProteinSignals>
> => {
  const response = await fetch("/data/refseq_annotated_proteins.tsv", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Annotated protein TSV unavailable");
  }

  const tsv = await response.text();
  const rows = parseTsv(tsv);

  const byPhage: Record<string, PhageProteinSignals> = {};

  for (const [phageId, product, classification, predictionSource] of rows) {
    if (!phageId) {
      continue;
    }

    if (!byPhage[phageId]) {
      byPhage[phageId] = defaultSignals();
    }

    const aggregate = byPhage[phageId];
    aggregate.total_proteins += 1;

    const text =
      `${product} ${classification} ${predictionSource}`.toLowerCase();

    if (hasAnyKeyword(text, antiCrisprKeywords)) {
      aggregate.anti_crispr_hits += 1;
    }

    if (hasAnyKeyword(text, amrKeywords)) {
      aggregate.amr_hits += 1;
    }

    if (hasAnyKeyword(text, virulenceKeywords)) {
      aggregate.virulence_hits += 1;
    }

    if (hasAnyKeyword(text, transmembraneKeywords)) {
      aggregate.transmembrane_hits += 1;
    }

    if (hasAnyKeyword(text, integraseKeywords)) {
      aggregate.integrase_hits += 1;
    }
  }

  return byPhage;
};

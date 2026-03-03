# Protein annotation data for ranked result enrichment

To enable protein-derived signals in ranked result cards, place the annotated protein TSV at:

- `apps/web/public/data/refseq_annotated_proteins.tsv`

This file should be the downloaded RefSeq annotated protein metadata TSV (`refseq_phage_annotated_protein_meta_data.tsv`) renamed to the path above.

## How signals are computed

The app parses `Product`, `Protein_classification`, and `Function_prediction_source` from each row, then applies keyword matching to derive per-phage counts for:

- Total proteins
- Anti-CRISPR hits
- AMR hits
- Virulence hits
- Transmembrane/membrane hits
- Integrase/lysogeny marker hits

These signals are keyword-derived heuristics from annotation text and are **not guaranteed ground truth**.

## Behavior when missing

If `apps/web/public/data/refseq_annotated_proteins.tsv` is not present (for example, 404), the app silently skips these enrichment signals and continues normal ranking behavior.

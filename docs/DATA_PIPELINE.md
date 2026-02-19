# Data Pipeline

This repository stores downloaded source files under `data/raw/`, derived artifacts under
`data/processed/`, and web-consumable JSON in `apps/web/public/data/`.

## RefSeq PhageScope metadata conversion

Use the conversion script to build canonical app JSON from the RefSeq Phage Meta Data table.

```bash
python scripts/convert_phagescope_refseq_meta.py data/raw/refseq_phage_meta_data.tsv
```

### Inputs

- `data/raw/refseq_phage_meta_data.tsv` (default)
- Delimiter is auto-detected (`\t`, `,`, or `;`)

### Output

- `apps/web/public/data/phagescope.json`

### Canonical JSON fields

Each output record uses the following schema:

```json
{
  "id": "string",
  "name": "string",
  "host_species": "string|null",
  "lifecycle": "lytic|temperate|null",
  "source_url": "https://www.ncbi.nlm.nih.gov/nuccore/{Phage_ID}",
  "taxonomy": "string|null",
  "completeness": "string|null",
  "length_kb": "number|null",
  "gc_content": "number|null",
  "cluster": "string|null",
  "subcluster": "string|null"
}
```

### Console stats

The script prints:

- total record count
- top 10 `host_species`
- `% with lifecycle`
- `% with completeness`

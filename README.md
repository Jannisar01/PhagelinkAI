# PhageAI Match MVP Monorepo

Minimal modular MVP skeleton for **PhageAI Match**.

## Structure

- `apps/web`: Next.js (App Router) + TypeScript + Tailwind + shadcn-style UI components
- `apps/api`: FastAPI service exposing `/health` and `/rank`
- `packages/core`: pure Python scoring logic (no DB/network/framework coupling)
- `packages/shared`: shared TS constants/types
- `packages/integrations`: integration stubs (PhageScope, PDF/email)

## Prerequisites

- Node.js 18+
- Python 3.11+

## Install

```bash
npm install
python -m pip install -r apps/api/requirements.txt pytest ruff black
```

## Run both services (recommended)

```bash
make dev
```

- Web: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

## Run individually

```bash
make dev-api
make dev-web
```

## Test core scoring package

```bash
make test-core
```

## Lint/format

```bash
make lint-py
make format-py
npm --workspace apps/web run lint
npm --workspace apps/web run format
```

## API contract

### `GET /health`

Returns:

```json
{"ok": true}
```

### `POST /rank`

Input:

```json
{
  "host_species": "Escherichia coli",
  "candidates": [
    {
      "id": "p1",
      "name": "EcoM-Lytic-1",
      "host_species": "Escherichia coli",
      "lifecycle": "lytic",
      "source_url": "https://example.org/phage/p1"
    }
  ]
}
```

Output: ranked phage list with `score` and `reasons_json`.

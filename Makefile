.PHONY: dev dev-api dev-web test-core lint-py format-py

dev:
	npm run dev

dev-api:
	PYTHONPATH=packages/core/src uvicorn main:app --app-dir apps/api --reload --port 8000

dev-web:
	npm --workspace apps/web run dev

test-core:
	PYTHONPATH=packages/core/src pytest packages/core/tests

lint-py:
	ruff check .

format-py:
	black .

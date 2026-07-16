#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

unset OPENAI_API_KEY
export CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture

uv sync --extra dev --locked
uv run ruff check .
uv run pytest -q

(
    cd frontend
    npm ci
    npm test -- --run
    npm run lint
    npm run build
    git diff --exit-code -- ../src/cross_examine/static
    if [[ "$(uname -s)" == "Linux" ]]; then
        npx playwright install --with-deps chromium
    else
        npx playwright install chromium
    fi
    npm run test:e2e
)

uv run --isolated --no-editable cross-examine demo --no-open

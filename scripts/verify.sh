#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

unset OPENAI_API_KEY CROSS_EXAMINE_DB CROSS_EXAMINE_RUNS CROSS_EXAMINE_INTERNAL_PLAYWRIGHT_WORKSPACE
export CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture

verify_workspace="$(mktemp -d "${TMPDIR:-/tmp}/cross-examine-verify.XXXXXX")"
cleanup_verify_workspace() {
    if ! rm -rf -- "$verify_workspace"; then
        printf '%s\n' "warning: could not remove verifier workspace: $verify_workspace" >&2
    fi
}
trap cleanup_verify_workspace EXIT

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

first_demo_output="$(
    uv run --isolated --no-editable cross-examine demo --no-open \
        --workspace "$verify_workspace"
)"
printf '%s\n' "$first_demo_output"
if [[ "$first_demo_output" != *"Verdict: BROKEN"* ]] || \
    [[ "$first_demo_output" != *"Corpus: +2 this run · 2 total"* ]]; then
    printf '%s\n' 'fresh hero demo did not produce BROKEN with +2/2' >&2
    exit 1
fi

repeat_demo_output="$(
    uv run --isolated --no-editable cross-examine demo --no-open \
        --workspace "$verify_workspace"
)"
printf '%s\n' "$repeat_demo_output"
if [[ "$repeat_demo_output" != *"Verdict: BROKEN"* ]] || \
    [[ "$repeat_demo_output" != *"Corpus: +0 this run · 2 total"* ]]; then
    printf '%s\n' 'repeat hero demo did not produce BROKEN with +0/2' >&2
    exit 1
fi

trap - EXIT
if ! rm -rf -- "$verify_workspace"; then
    printf '%s\n' "could not remove verifier workspace: $verify_workspace" >&2
    exit 1
fi

$ErrorActionPreference = 'Stop'

function Assert-LastExitCode([string]$Step) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE"
    }
}

uv sync --extra dev
Assert-LastExitCode 'uv sync'
uv run ruff check .
Assert-LastExitCode 'Ruff'
uv run pytest -q
Assert-LastExitCode 'Python tests'

Push-Location frontend
try {
    npm ci
    Assert-LastExitCode 'npm ci'
    npm test -- --run
    Assert-LastExitCode 'frontend tests'
    npm run build
    Assert-LastExitCode 'frontend build'
    npx playwright install chromium
    Assert-LastExitCode 'Playwright Chromium install'
    npm run test:e2e
    Assert-LastExitCode 'Playwright tests'
}
finally {
    Pop-Location
}

$env:CROSS_EXAMINE_DEMO_CHARACTERIZER = 'fixture'
uv run --isolated --no-editable cross-examine demo --no-open
Assert-LastExitCode 'hero demo'

$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
$env:CROSS_EXAMINE_DEMO_CHARACTERIZER = 'fixture'

function Assert-LastExitCode([string]$Step) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE"
    }
}

uv sync --extra dev --locked
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
    npm run lint
    Assert-LastExitCode 'frontend lint'
    npm run build
    Assert-LastExitCode 'frontend build'
    # Vite's native Tailwind/Oxide path can emit platform-specific floating-point
    # literals. Linux and macOS enforce the committed production bundle; Windows
    # verifies that its native build succeeds and passes the same functional suite.
    npx playwright install chromium
    Assert-LastExitCode 'Playwright Chromium install'
    npm run test:e2e
    Assert-LastExitCode 'Playwright tests'
}
finally {
    Pop-Location
}

uv run --isolated --no-editable cross-examine demo --no-open
Assert-LastExitCode 'hero demo'

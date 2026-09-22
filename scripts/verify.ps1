$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:CROSS_EXAMINE_DB -ErrorAction SilentlyContinue
Remove-Item Env:CROSS_EXAMINE_RUNS -ErrorAction SilentlyContinue
Remove-Item Env:CROSS_EXAMINE_INTERNAL_PLAYWRIGHT_WORKSPACE -ErrorAction SilentlyContinue
$env:CROSS_EXAMINE_DEMO_CHARACTERIZER = 'fixture'
$verifyWorkspace = Join-Path ([IO.Path]::GetTempPath()) ("cross-examine-verify-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $verifyWorkspace | Out-Null
$verifySucceeded = $false

function Assert-LastExitCode([string]$Step) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE"
    }
}

try {
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

    $firstDemoOutput = uv run --isolated --no-editable cross-examine demo --no-open --workspace $verifyWorkspace | Out-String
    Assert-LastExitCode 'fresh hero demo'
    Write-Output ($firstDemoOutput.TrimEnd())
    if (-not $firstDemoOutput.Contains('Verdict: BROKEN') -or
        $firstDemoOutput -notmatch '(?m)^Corpus: \+2 this run [^0-9\r\n]+2 total\r?$') {
        throw 'fresh hero demo did not produce BROKEN with +2/2'
    }

    $repeatDemoOutput = uv run --isolated --no-editable cross-examine demo --no-open --workspace $verifyWorkspace | Out-String
    Assert-LastExitCode 'repeat hero demo'
    Write-Output ($repeatDemoOutput.TrimEnd())
    if (-not $repeatDemoOutput.Contains('Verdict: BROKEN') -or
        $repeatDemoOutput -notmatch '(?m)^Corpus: \+0 this run [^0-9\r\n]+2 total\r?$') {
        throw 'repeat hero demo did not produce BROKEN with +0/2'
    }
    $verifySucceeded = $true
}
finally {
    try {
        if (Test-Path -LiteralPath $verifyWorkspace) {
            Remove-Item -LiteralPath $verifyWorkspace -Recurse -Force -ErrorAction Stop
        }
    }
    catch {
        if ($verifySucceeded) {
            throw
        }
        Write-Warning ("Verifier failed and workspace cleanup also failed: " + $_.Exception.Message)
    }
}

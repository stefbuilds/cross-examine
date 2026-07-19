from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


def test_canonical_verifiers_clear_operator_state_and_isolate_the_demo() -> None:
    posix = (REPOSITORY_ROOT / "scripts" / "verify.sh").read_text(encoding="utf-8")
    powershell = (REPOSITORY_ROOT / "scripts" / "verify.ps1").read_text(
        encoding="utf-8"
    )

    assert (
        "unset OPENAI_API_KEY CROSS_EXAMINE_DB CROSS_EXAMINE_RUNS "
        "CROSS_EXAMINE_INTERNAL_PLAYWRIGHT_WORKSPACE" in posix
    )
    assert "mktemp -d" in posix
    assert '--workspace "$verify_workspace"' in posix
    assert "Corpus: +2 this run · 2 total" in posix
    assert "Corpus: +0 this run · 2 total" in posix

    for variable in (
        "OPENAI_API_KEY",
        "CROSS_EXAMINE_DB",
        "CROSS_EXAMINE_RUNS",
        "CROSS_EXAMINE_INTERNAL_PLAYWRIGHT_WORKSPACE",
    ):
        assert f"Remove-Item Env:{variable} -ErrorAction SilentlyContinue" in powershell
    assert "[guid]::NewGuid()" in powershell
    assert "--workspace $verifyWorkspace" in powershell
    assert "·" not in powershell
    assert "(?m)^Corpus: \\+2 this run [^0-9\\r\\n]+2 total\\r?$" in powershell
    assert "(?m)^Corpus: \\+0 this run [^0-9\\r\\n]+2 total\\r?$" in powershell
    assert "Contains('2 total')" not in powershell
    assert "Remove-Item -LiteralPath $verifyWorkspace -Recurse -Force -ErrorAction Stop" in powershell
    assert "$verifySucceeded = $false" in powershell
    assert "if ($verifySucceeded)" in powershell
    assert "Write-Warning" in powershell
    assert "finally {\n    try {\n        if (Test-Path -LiteralPath $verifyWorkspace)" in powershell
    assert "trap - EXIT" in posix


def test_cli_demo_fresh_and_repeat_subprocesses_are_bounded() -> None:
    cli_demo_test = (
        REPOSITORY_ROOT / "tests" / "e2e" / "test_cli_demo.py"
    ).read_text(encoding="utf-8")

    assert "DEMO_TIMEOUT_SECONDS = 120" in cli_demo_test
    assert cli_demo_test.count("timeout=DEMO_TIMEOUT_SECONDS") == 2


def test_playwright_server_startup_allows_a_cold_package_build_but_is_bounded() -> None:
    playwright_config = (
        REPOSITORY_ROOT / "frontend" / "playwright.config.ts"
    ).read_text(encoding="utf-8")

    assert "timeout: 300_000" in playwright_config


def test_release_subprocesses_and_ci_job_have_outer_deadlines() -> None:
    wheel_test = (
        REPOSITORY_ROOT / "tests" / "release" / "test_wheel_install.py"
    ).read_text(encoding="utf-8")
    local_product_test = (
        REPOSITORY_ROOT / "tests" / "release" / "test_local_product_run.py"
    ).read_text(encoding="utf-8")
    workflow = (
        REPOSITORY_ROOT / ".github" / "workflows" / "verify.yml"
    ).read_text(encoding="utf-8")

    for release_test in (wheel_test, local_product_test):
        assert "RELEASE_SUBPROCESS_TIMEOUT_SECONDS = 300" in release_test
        assert "timeout=RELEASE_SUBPROCESS_TIMEOUT_SECONDS" in release_test
        assert '"PYTHONPATH"' in release_test
        assert '"PYTHONHOME"' in release_test
        assert 'environment["PYTHONNOUSERSITE"] = "1"' in release_test
    assert "timeout-minutes: 45" in workflow

"""Release checks for the same editable installation used by the judge quickstart."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def test_editable_install_imports_from_outside_the_checkout(tmp_path: Path) -> None:
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            (
                "import cross_examine.cli; "
                "import cross_examine.cross_examine.probe_runner; "
                "print(cross_examine.cli.__file__)"
            ),
        ],
        cwd=tmp_path,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    assert "src/cross_examine/cli.py" in result.stdout.replace("\\", "/")

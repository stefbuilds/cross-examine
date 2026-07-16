import subprocess
import sys
from pathlib import Path

from cross_examine.codec import report_from_json


def test_generator_captures_a_real_hero_pipeline_report(tmp_path: Path) -> None:
    output = tmp_path / "broken.json"
    project_root = Path(__file__).parents[2]

    subprocess.run(
        [
            sys.executable,
            "scripts/generate_hosted_fixture.py",
            "--output",
            str(output),
        ],
        check=True,
        cwd=project_root,
    )

    report = report_from_json(output.read_text(encoding="utf-8"))
    finding = report.refuted[0]
    assert "cross_examine.cross_examine.probe_runner call normalizer.core:normalize" in finding.command
    assert '"value": []' in finding.output
    assert '"value": null' in finding.output
    assert finding.repro_input == "[]"
    assert finding.expected == "[]"
    assert finding.actual == "null"
    assert report.corpus is not None
    assert (report.corpus.pinned_this_run, report.corpus.corpus_total) == (2, 2)

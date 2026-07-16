"""Vercel entrypoint for the Cross-Examine FastAPI application."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from cross_examine.api.app import create_app  # noqa: E402


app = create_app(
    "/tmp/cross-examine.db",
    runs_root="/tmp/cross-examine-runs",
    hosted_mode=True,
)

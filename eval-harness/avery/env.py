"""Tiny .env loader (no python-dotenv dependency).

Reads KEY=VALUE lines from eval-harness/.env into os.environ so a real run can pick up the
MiniMax key without exporting anything by hand. Real shell env always wins (we never override).
"""
from __future__ import annotations

import os
from pathlib import Path


def load_dotenv(path: str | Path) -> None:
    p = Path(path)
    if not p.exists():
        return
    for raw in p.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        key, val = key.strip(), val.strip().strip('"').strip("'")
        if key and key not in os.environ:  # do not override a real shell env var
            os.environ[key] = val

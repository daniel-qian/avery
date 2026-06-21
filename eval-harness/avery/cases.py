"""Case loading. A case file is messy raw inputs + an optional `<!-- MOCK ... -->` block.

The MOCK block is a JSON object that the deterministic MockBrain follows so the whole pipeline
runs green with no API key. The RealBrain ignores it entirely. The block is authored per case,
which is honest: mock mode exercises *plumbing and gates*; real mode exercises *judgment*.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

_MOCK_RE = re.compile(r"<!--\s*MOCK\s*(\{.*?\})\s*-->", re.S)


@dataclass
class Case:
    case_id: str
    path: Path
    prompt: str                      # the leader's actual question
    body: str                        # full case markdown (raw inputs), MOCK block stripped
    mock: dict = field(default_factory=dict)

    @property
    def has_real_problem(self) -> bool:
        """ADR-0016 tag: does the case contain genuine, team-impacting underperformance (the
        'kind read is the wrong read' family)? Drives the calibration/avoidance judge signal."""
        return bool(self.mock.get("has_real_problem", False))


def load_case(path: str | Path) -> Case:
    path = Path(path)
    text = path.read_text(encoding="utf-8")

    mock: dict = {}
    m = _MOCK_RE.search(text)
    if m:
        mock = json.loads(m.group(1))
    body = _MOCK_RE.sub("", text).strip()

    # The leader's question: first line under a "## Question" / "## Ask" heading, else mock-supplied.
    prompt = mock.get("prompt") or _extract_question(body) or "What should I do here?"

    return Case(case_id=path.stem, path=path, prompt=prompt, body=body, mock=mock)


def _extract_question(body: str) -> str | None:
    lines = body.splitlines()
    for i, ln in enumerate(lines):
        if re.match(r"#+\s*(question|the ask|ask)\b", ln.strip(), re.I):
            for nxt in lines[i + 1:]:
                if nxt.strip():
                    return nxt.strip().lstrip("> ").strip()
    return None

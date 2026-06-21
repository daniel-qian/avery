"""Markdown memory + keyword recall (no vector DB — RESOLVED Q2).

Memory is two plain files, `facts.md` and `notes.md`. `recall(query)` is a keyword search over
their lines; it returns line-addressable hits (`facts.md:15`) so every cite() can point at a
real, inspectable line. This keeps the transcript honest about *what Avery actually read*.
Swap in a vector index later behind this same signature with zero loop changes.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

_WORD = re.compile(r"[a-z0-9]+")
_STOP = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are", "was", "were",
    "her", "his", "their", "she", "he", "they", "it", "that", "this", "with", "has", "have",
    "at", "by", "as", "be", "but", "not", "no", "do", "does", "what", "how", "should", "i",
    "me", "my", "you", "your", "about", "any", "can", "could", "would",
}

MEMORY_FILES = ("facts.md", "notes.md")


@dataclass
class Hit:
    source: str   # e.g. "facts.md:15"
    text: str
    score: int    # number of distinct query tokens matched

    def as_line(self) -> str:
        return f"{self.source}  {self.text}"


def _tokens(s: str) -> set[str]:
    return {w for w in _WORD.findall(s.lower()) if w not in _STOP and len(w) > 1}


def load_facts_head(memory_dir: Path, max_lines: int = 12) -> str:
    """The 'first N lines' pattern (Claude Code): a slice of facts.md preloaded into context;
    the rest is pulled on demand via recall(), keeping context lean."""
    path = Path(memory_dir) / "facts.md"
    if not path.exists():
        return ""
    lines = path.read_text(encoding="utf-8").splitlines()
    body = [ln for ln in lines if ln.strip() and not ln.lstrip().startswith(">")]
    return "\n".join(body[:max_lines])


def recall(query: str, memory_dir: Path, limit: int = 8) -> list[Hit]:
    """Keyword search over facts.md + notes.md. Returns line-addressable hits, ranked by how
    many distinct query tokens each line matches."""
    q = _tokens(query)
    hits: list[Hit] = []
    for fname in MEMORY_FILES:
        path = Path(memory_dir) / fname
        if not path.exists():
            continue
        for i, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            line = raw.strip()
            if not line or line.startswith(("#", ">")):
                continue
            text = line.lstrip("- ").strip()
            matched = q & _tokens(line)
            if matched:
                hits.append(Hit(source=f"{fname}:{i}", text=text, score=len(matched)))
    hits.sort(key=lambda h: h.score, reverse=True)
    return hits[:limit]


def resolve_ref(source_ref: str, memory_dir: Path, case_path: Path | None) -> str | None:
    """Return the exact line a `cite()` source_ref points at, or None if it doesn't resolve.
    Accepts 'facts.md:15', 'notes.md:2', or '<case-basename>:12' / 'case:12'."""
    m = re.match(r"\s*([^:]+):(\d+)\s*$", source_ref or "")
    if not m:
        return None
    name, lineno = m.group(1).strip(), int(m.group(2))
    if name in MEMORY_FILES:
        path = Path(memory_dir) / name
    elif case_path is not None and (name in ("case", Path(case_path).name, Path(case_path).stem)):
        path = Path(case_path)
    else:
        return None
    if not path.exists():
        return None
    lines = path.read_text(encoding="utf-8").splitlines()
    if 1 <= lineno <= len(lines):
        return lines[lineno - 1].strip()
    return None

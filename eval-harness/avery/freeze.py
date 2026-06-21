"""Freezing + hashing the scenario set.

Pre-registration is what makes the eval defensible: the scenario manifest, every case file it
references, the red-line rules, and the skill files are hashed BEFORE any run, and the hash is
recorded in each run's output. If anyone edits a case after the fact, the hash changes and the
drift is detectable (`runner.py --check-frozen`).

Pure stdlib (hashlib + optional git via subprocess) — no third-party deps.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

# What counts as "the frozen eval definition" beyond the manifest itself.
EXTRA_FROZEN = ["redline_rules.md", "skills/00-relational-model.md",
                "skills/01-red-line.md", "skills/02-kind-read-can-be-wrong.md",
                "memory/facts.md", "memory/notes.md"]


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _git(root: Path, *args: str) -> str | None:
    try:
        out = subprocess.run(["git", *args], cwd=root, capture_output=True, text=True, timeout=10)
        return out.stdout.strip() if out.returncode == 0 else None
    except (OSError, subprocess.SubprocessError):  # pragma: no cover - git optional
        return None


def frozen_files(manifest_path: Path) -> list[Path]:
    """The manifest + every case it references + the extra frozen definition files."""
    manifest_path = Path(manifest_path)
    root = manifest_path.parent.parent  # eval-harness/
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    files = [manifest_path]
    for sc in manifest.get("scenarios", []):
        files.append(root / sc["case"])
    files += [root / p for p in EXTRA_FROZEN]
    # unique, existing, deterministic order
    seen, out = set(), []
    for f in files:
        f = f.resolve()
        if f not in seen and f.exists():
            seen.add(f)
            out.append(f)
    return sorted(out, key=lambda p: str(p))


def compute_freeze(manifest_path: Path) -> dict:
    """Return {manifest_hash, files:[{path, sha256}], git_commit, git_dirty}."""
    manifest_path = Path(manifest_path)
    root = manifest_path.parent.parent
    files = frozen_files(manifest_path)

    per_file, h = [], hashlib.sha256()
    for f in files:
        rel = f.relative_to(root.resolve()).as_posix()
        digest = _sha(f.read_bytes())
        per_file.append({"path": rel, "sha256": digest})
        h.update(rel.encode() + b"\0" + digest.encode() + b"\n")

    commit = _git(root, "rev-parse", "HEAD")
    status = _git(root, "status", "--porcelain")
    return {
        "manifest_hash": h.hexdigest(),
        "files": per_file,
        "git_commit": commit,
        "git_dirty": bool(status) if status is not None else None,
    }


LOCK_NAME = "FROZEN.lock.json"


def write_lock(manifest_path: Path) -> dict:
    freeze = compute_freeze(manifest_path)
    lock = Path(manifest_path).parent / LOCK_NAME
    lock.write_text(json.dumps(freeze, indent=2) + "\n", encoding="utf-8")
    return freeze


def check_lock(manifest_path: Path) -> tuple[bool, dict]:
    """Compare the current freeze against the committed lock. Returns (ok, current_freeze)."""
    lock = Path(manifest_path).parent / LOCK_NAME
    current = compute_freeze(manifest_path)
    if not lock.exists():
        return False, current
    saved = json.loads(lock.read_text(encoding="utf-8"))
    return saved.get("manifest_hash") == current["manifest_hash"], current

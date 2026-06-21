#!/usr/bin/env python3
"""011b — the batch scenario runner.

Runs every scenario in the frozen manifest through Avery's loop AND the baseline agents on the
IDENTICAL prompt + evidence, dumps a JSON transcript per (scenario, agent), and emits a
judge-ready set with position-bias controls. Mock by default (green AFK, no key); `--real`
switches Avery to claude-opus-4-8.

    python runner.py                       # mock run -> runs/<hash>/...
    python runner.py --out runs/dev --seed 7
    python runner.py --check-frozen        # verify the scenario set hasn't drifted
    python runner.py --freeze              # (re)write FROZEN.lock.json after an intentional edit

Acceptance (issue #4):
  * full manifest for Avery + >=1 baseline, JSON per (scenario, agent)         [done, mock]
  * manifest frozen + git-hashed; hash recorded in output                      [run_meta.json]
  * both baseline variants (raw, scaffolded-minus-redline)                     [in manifest]
  * order randomized + swap-and-rerun to kill position bias                    [judgeset.json]
  * runs green on mock scenarios                                               [tests/test_runner.py]
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from avery import freeze, skills  # noqa: E402
from avery.brain import RealBrain, make_mock_brain  # noqa: E402
from avery.cases import load_case  # noqa: E402
from avery.loop import run_loop  # noqa: E402

SKILLS_DIR = HERE / "skills"
MEMORY_DIR = HERE / "memory"
MANIFEST = HERE / "scenarios" / "manifest.json"


def make_brain(agent_cfg: dict, case, *, real: bool):
    """Pick the brain for an agent. Mock is fully offline; real wires Avery to claude-opus-4-8.

    Real baseline brains (codex/GPT for the non-Avery configs) are intentionally NOT stubbed in
    as if working — the loop is identical, only the provider message-translation differs, and
    real runs are gated on partner materials anyway. In real mode a baseline raises a clear
    pointer rather than silently producing fake data. Mock is the supported AFK path.
    """
    persona = agent_cfg["persona"]
    if not real:
        return make_mock_brain(case, persona)
    if persona == "avery":
        return RealBrain(name=agent_cfg["name"])
    raise NotImplementedError(
        f"real baseline brain for '{agent_cfg['name']}' not wired — add an OpenAI/other-family "
        f"brain mirroring RealBrain (same loop, different message translation). Use mock mode for "
        f"the offline pipeline; real baselines land with partner materials (feat-012).")


def run(manifest_path: Path = MANIFEST, out_dir: Path | None = None, *, seed: int | None = None,
        real: bool = False, swap: bool = True) -> dict:
    manifest = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
    seed = manifest.get("default_seed", 0) if seed is None else seed
    rng = random.Random(seed)

    frz = freeze.compute_freeze(manifest_path)
    out_dir = Path(out_dir) if out_dir else (HERE / "runs" / frz["manifest_hash"][:12])
    (out_dir / "transcripts").mkdir(parents=True, exist_ok=True)

    agents = manifest["agents"]
    scenarios = manifest["scenarios"]
    rows, transcripts = [], {}

    for sc in scenarios:
        case = load_case(HERE / sc["case"])
        for ag in agents:
            system_prompt = skills.build_system_prompt(SKILLS_DIR, MEMORY_DIR, scaffold=ag["scaffold"])
            brain = make_brain(ag, case, real=real)
            t = run_loop(brain, case, system_prompt, agent_name=ag["name"], scaffold=ag["scaffold"],
                         memory_dir=MEMORY_DIR, enforce_chain=ag["enforce_chain"],
                         enforce_redline=ag["enforce_redline"])
            t["agent_kind"] = ag.get("kind")
            t["baseline_variant"] = ag.get("baseline_variant")
            fname = f"{sc['id']}__{ag['name']}.json"
            (out_dir / "transcripts" / fname).write_text(
                json.dumps(t, indent=2, ensure_ascii=False), encoding="utf-8")
            transcripts[(sc["id"], ag["name"])] = f"transcripts/{fname}"
            rows.append({
                "scenario": sc["id"], "agent": ag["name"], "kind": ag.get("kind"),
                "redline_passed": t["redline"]["passed"], "redline": t["redline"]["summary"],
                "cite_gate": t["gates"]["cite_gate_passed"],
                "used_draft_advice": t["used_draft_advice"], "stop_reason": t["stop_reason"],
            })

    judgeset = _build_judgeset(scenarios, agents, transcripts, rng, swap)
    (out_dir / "judgeset.json").write_text(json.dumps(judgeset, indent=2), encoding="utf-8")

    meta = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mode": "real" if real else "mock",
        "seed": seed,
        "swap_and_rerun": swap,
        "manifest_path": Path(manifest_path).name,
        "freeze": frz,
        "agents": agents,
        "scenarios": scenarios,
        "n_transcripts": len(transcripts),
        "non_danny_scenarios": sum(1 for s in scenarios if s.get("authored_by") != "danny"),
        "summary": rows,
        "claims_allowed": ["grounding", "actionability", "humanity", "red-line-adherence"],
        "claims_forbidden": ["outcome", "ROI", "makes-your-team-better"],
        "note": "MOCK set unless mode=real. non_danny_scenarios must be >=3 for the publishable run.",
    }
    (out_dir / "run_meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False),
                                           encoding="utf-8")
    return {"out_dir": str(out_dir), "meta": meta, "judgeset": judgeset, "rows": rows}


def _build_judgeset(scenarios, agents, transcripts, rng: random.Random, swap: bool) -> dict:
    """Pair the system-under-test against each baseline, per scenario. Randomize left/right
    order (seeded) and, when swap=True, add the swapped duplicate so 011c can judge both
    orderings and cancel position bias."""
    suts = [a["name"] for a in agents if a.get("kind") == "system-under-test"]
    baselines = [a["name"] for a in agents if a.get("kind") == "baseline"]
    comparisons = []
    for sc in scenarios:
        for sut in suts:
            for base in baselines:
                a = {"agent": sut, "transcript": transcripts[(sc["id"], sut)]}
                b = {"agent": base, "transcript": transcripts[(sc["id"], base)]}
                left, right = (a, b) if rng.random() < 0.5 else (b, a)
                cid = f"{sc['id']}#{sut}_vs_{base}"
                comparisons.append({"id": cid + "#o0", "scenario": sc["id"],
                                    "left": left, "right": right, "swap_of": None})
                if swap:
                    comparisons.append({"id": cid + "#o1", "scenario": sc["id"],
                                        "left": right, "right": left, "swap_of": cid + "#o0"})
    return {
        "position_bias_control": "each system-under-test vs baseline pairing appears in a "
                                 "seed-randomized order plus its swap; 011c judges both and "
                                 "checks agreement to cancel position bias.",
        "seed": rng.seed if False else None,  # seed lives in run_meta; kept out here intentionally
        "comparisons": comparisons,
    }


def _cli(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Batch scenario runner (011b).")
    ap.add_argument("--out", default=None, help="output dir (default runs/<hash>)")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--real", action="store_true", help="Avery on claude-opus-4-8 (needs key)")
    ap.add_argument("--no-swap", action="store_true", help="disable swapped judge pairings")
    ap.add_argument("--check-frozen", action="store_true", help="verify scenario set vs lock")
    ap.add_argument("--freeze", action="store_true", help="(re)write FROZEN.lock.json")
    args = ap.parse_args(argv)

    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

    if args.freeze:
        frz = freeze.write_lock(MANIFEST)
        print(f"wrote {freeze.LOCK_NAME}: manifest_hash={frz['manifest_hash'][:16]}…")
        return 0
    if args.check_frozen:
        ok, cur = freeze.check_lock(MANIFEST)
        print(("OK — frozen set matches lock" if ok else "DRIFT — scenario set changed since lock")
              + f"  (hash {cur['manifest_hash'][:16]}…)")
        return 0 if ok else 2

    result = run(MANIFEST, args.out, seed=args.seed, real=args.real, swap=not args.no_swap)
    print(f"\nrun -> {result['out_dir']}  (mock)  hash={result['meta']['freeze']['manifest_hash'][:12]}…\n")
    print(f"{'scenario':<34}{'agent':<32}{'red-line':<22}{'cite':<6}{'artifact'}")
    print("-" * 100)
    for r in result["rows"]:
        print(f"{r['scenario']:<34}{r['agent']:<32}{r['redline']:<22}"
              f"{'yes' if r['cite_gate'] else 'no':<6}{'yes' if r['used_draft_advice'] else 'no'}")
    print(f"\n{result['meta']['n_transcripts']} transcripts, "
          f"{len(result['judgeset']['comparisons'])} judge comparisons "
          f"(swap={'on' if not args.no_swap else 'off'}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(_cli())

#!/usr/bin/env python3
"""011a end-to-end demo: run ONE scenario through Avery's loop and print the transcript.

    python run_one.py cases/lin-qing-checkin.md            # mock brain (no key needed)
    python run_one.py cases/lin-qing-checkin.md --real     # claude-opus-4-8 (needs ANTHROPIC_API_KEY)
    python run_one.py cases/lin-qing-checkin.md --json      # dump full transcript JSON

Proves: the fixed chain read_case -> recall -> cite -> draft_advice runs end-to-end; cite() is
un-skippable before advice; the red-line validator passes Avery's humane-but-decisive output.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from avery import skills  # noqa: E402
from avery.brain import RealBrain, make_mock_brain  # noqa: E402
from avery.cases import load_case  # noqa: E402
from avery.loop import run_loop  # noqa: E402

SKILLS_DIR = HERE / "skills"
MEMORY_DIR = HERE / "memory"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Run one scenario through Avery (011a).")
    ap.add_argument("case", help="path to a case .md file")
    ap.add_argument("--real", action="store_true", help="use claude-opus-4-8 (needs API key)")
    ap.add_argument("--json", action="store_true", help="print the full transcript as JSON")
    args = ap.parse_args(argv)

    try:  # Windows consoles default to a legacy codec that can't encode ✓/→/«»/emoji.
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

    case = load_case(args.case)
    system_prompt = skills.build_system_prompt(SKILLS_DIR, MEMORY_DIR, scaffold="full")
    brain = RealBrain(name="avery-opus") if args.real else make_mock_brain(case, "avery")

    transcript = run_loop(
        brain, case, system_prompt, agent_name=brain.name, scaffold="full",
        memory_dir=MEMORY_DIR, enforce_chain=True, enforce_redline=True)

    if args.json:
        print(json.dumps(transcript, indent=2, ensure_ascii=False))
        return 0 if transcript["redline"]["passed"] else 1

    _pretty(transcript)
    return 0 if (transcript["redline"]["passed"] and transcript["gates"]["cite_gate_passed"]) else 1


def _pretty(t: dict) -> None:
    print(f"\n=== {t['agent']}  ·  case: {t['case_id']}  ·  scaffold: {t['scaffold']} ===\n")
    print(f"LEADER ASKS: {t['prompt']}\n")
    for s in t["steps"]:
        if s["type"] == "tool_call":
            tag = "  ✗" if s.get("is_error") else "  →"
            arg_preview = json.dumps(s["input"], ensure_ascii=False)
            if len(arg_preview) > 90:
                arg_preview = arg_preview[:87] + "…"
            print(f"{tag} {s['name']}({arg_preview})")
            obs = s["observation"].replace("\n", "\n      ")
            if len(obs) > 320:
                obs = obs[:317] + "…"
            print(f"      {obs}")
        else:
            print("\n--- FINAL ADVICE ---")
            print(s["text"])
    print("\n--- EVIDENCE (cite registry) ---")
    for c in t["cites"]:
        mark = "✓" if c["resolved"] else "⚠ unresolved"
        print(f"  {mark}  «{c['claim']}» ⟵ {c['source_ref']}")
    g, rl = t["gates"], t["redline"]
    print("\n--- GATES ---")
    print(f"  cite gate (≥1 resolved cite before advice): {'PASS' if g['cite_gate_passed'] else 'FAIL'}")
    print(f"  artifact gate (advice via draft_advice)    : {'PASS' if g['artifact_gate_passed'] else 'FAIL'}")
    print(f"  red-line validator                         : {rl['summary']}")
    if rl["violations"]:
        for v in rl["violations"]:
            print(f"      ✗ {v['rule_id']}: «{v['snippet']}»")
    print()


if __name__ == "__main__":
    raise SystemExit(main())

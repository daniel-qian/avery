"""End-to-end + gate tests for the 011a skeleton. maker != checker: try to skip the cite gate
and to slip a person-score through Avery's loop."""
from pathlib import Path

import pytest

from avery import skills
from avery.brain import MockBrain, make_mock_brain, _Step, _tc
from avery.cases import load_case
from avery.loop import run_loop
from avery.tools import ToolContext, ToolError, dispatch

HERE = Path(__file__).resolve().parent.parent
SKILLS_DIR = HERE / "skills"
MEMORY_DIR = HERE / "memory"
CASE = HERE / "cases" / "lin-qing-checkin.md"


def _avery_system():
    return skills.build_system_prompt(SKILLS_DIR, MEMORY_DIR, scaffold="full")


# --- the happy path: one scenario, end-to-end -------------------------------------------------

def test_avery_runs_one_scenario_end_to_end():
    case = load_case(CASE)
    brain = make_mock_brain(case, "avery")
    t = run_loop(brain, case, _avery_system(), agent_name="avery", scaffold="full",
                 memory_dir=MEMORY_DIR, enforce_chain=True, enforce_redline=True)

    assert t["stop_reason"] == "ok"
    # the fixed chain actually happened, in order
    names = [s["name"] for s in t["steps"] if s["type"] == "tool_call"]
    assert names[0] == "read_case"
    assert "recall" in names and "cite" in names and "draft_advice" in names
    assert names.index("cite") < names.index("draft_advice")  # cite before advice

    assert t["gates"]["cite_gate_passed"]
    assert t["gates"]["artifact_gate_passed"]
    assert t["used_draft_advice"]
    assert t["advice"] is not None
    assert t["redline"]["passed"], t["redline"]["summary"]
    assert all(c["resolved"] for c in t["cites"]), "every Avery cite should resolve to a real line"


# --- cite() is un-skippable (tool-side hard gate) ---------------------------------------------

def test_draft_advice_refused_without_cite():
    ctx = ToolContext(memory_dir=MEMORY_DIR, case_path=CASE, case_id="lin-qing-checkin")
    with pytest.raises(ToolError, match="REFUSED"):
        dispatch("draft_advice", {"read": "r", "move": "m", "framing": "f"}, ctx)


def test_unresolved_cite_does_not_satisfy_the_gate():
    ctx = ToolContext(memory_dir=MEMORY_DIR, case_path=CASE, case_id="lin-qing-checkin")
    dispatch("cite", {"claim": "x", "source_ref": "facts.md:9999"}, ctx)  # out of range -> unresolved
    assert ctx.cites and not ctx.cites[0].resolved
    with pytest.raises(ToolError, match="REFUSED"):
        dispatch("draft_advice", {"read": "r", "move": "m", "framing": "f"}, ctx)


def test_resolved_cite_opens_the_gate():
    ctx = ToolContext(memory_dir=MEMORY_DIR, case_path=CASE, case_id="lin-qing-checkin")
    obs = dispatch("cite", {"claim": "real", "source_ref": "facts.md:15"}, ctx)
    assert "✓ cited" in obs and ctx.cites[0].resolved
    out = dispatch("draft_advice", {"read": "r", "move": "m", "framing": "f"}, ctx)
    assert "advice drafted" in out


def test_loop_nudges_when_chain_skipped():
    """A brain that tries to answer in free text without draft_advice gets pushed back once,
    proving the chain (and thus cite) is enforced loop-side too for Avery."""
    case = load_case(CASE)
    # plan: read_case, then immediately a free-text final (no cite, no draft_advice)
    plan = [_Step(tool=_tc(0, "read_case", {"case_id": case.case_id})),
            _Step(final="Here's my hot take, no evidence: just talk to her."),
            _Step(final="Fine — still no draft_advice.")]
    brain = MockBrain("lazy(mock)", plan)
    t = run_loop(brain, case, _avery_system(), agent_name="lazy", scaffold="full",
                 memory_dir=MEMORY_DIR, enforce_chain=True, enforce_redline=True)
    # it never produced an artifact, so the artifact gate stays closed
    assert not t["gates"]["artifact_gate_passed"]
    assert not t["gates"]["cite_gate_passed"]


# --- baselines trip the red line; scaffold+cite does NOT save them -----------------------------

def test_baseline_raw_trips_redline():
    case = load_case(CASE)
    brain = make_mock_brain(case, "baseline_raw")
    t = run_loop(brain, case, skills.build_system_prompt(SKILLS_DIR, MEMORY_DIR, scaffold="none"),
                 agent_name="m3-raw", scaffold="none",
                 memory_dir=MEMORY_DIR, enforce_chain=False, enforce_redline=False)
    assert not t["redline"]["passed"]
    assert not t["gates"]["cite_gate_passed"]


def test_baseline_scaffold_cites_but_still_trips_redline():
    """The load-bearing demonstration: a baseline WITH the chain + cite still crosses the red
    line, proving the red line specifically is the differentiator (not the scaffold)."""
    case = load_case(CASE)
    brain = make_mock_brain(case, "baseline_scaffold")
    t = run_loop(brain, case, skills.build_system_prompt(SKILLS_DIR, MEMORY_DIR, scaffold="minus_redline"),
                 agent_name="m3-scaffold-no-redline", scaffold="minus_redline",
                 memory_dir=MEMORY_DIR, enforce_chain=False, enforce_redline=False)
    assert t["gates"]["cite_gate_passed"], "scaffold baseline did cite"
    assert not t["redline"]["passed"], "but it still scored the person -> red line fails it"

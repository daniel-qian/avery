"""011c judge tests. maker != checker: assert the never-Claude guard, hard-gate->soft-dim order,
Cohen's kappa, position-bias control, and the NO outcome/ROI claim discipline — on mock."""
import json
from pathlib import Path

import pytest

import judge
import runner

HERE = Path(__file__).resolve().parent.parent
MANIFEST = HERE / "scenarios" / "manifest.json"


@pytest.fixture(scope="module")
def scored(tmp_path_factory):
    out = tmp_path_factory.mktemp("jrun")
    runner.run(MANIFEST, out, seed=1729, real=False, swap=True)
    res = judge.judge_run(out, seed=4242)
    res["_out"] = out
    return res


# --- the never-Claude guard (the headline constraint) -----------------------------------------

@pytest.mark.parametrize("family", [
    "anthropic:claude-opus-4-8", "claude-3-5-sonnet", "Claude", "opus", "haiku", "fable-5"])
def test_claude_as_judge_is_refused(family):
    with pytest.raises(ValueError, match="Claude-as-judge"):
        judge.assert_non_claude(family)


def test_default_judges_are_two_non_claude_families(scored):
    fams = scored["scorecard"]["judge_families"]
    assert len(fams) >= 2
    for f in fams:
        judge.assert_non_claude(f)  # must not raise
    assert not any("claude" in f.lower() or "anthropic" in f.lower() for f in fams)


# --- hard gates then soft dims ----------------------------------------------------------------

def test_every_transcript_scored_with_gates_and_soft_dims(scored):
    for key, vs in scored["verdicts"].items():
        assert len(vs) >= 2, f"{key} should be judged by >=2 families"
        for v in vs:
            assert set(v["hard_gates"]) == {"red_line", "grounded_evidence", "no_hallucination"}
            assert set(v["soft"]) == {"grounding", "actionability", "humanity", "calibration"}
            assert all(1 <= v["soft"][d] <= 5 for d in v["soft"])


def test_avery_beats_baselines_on_red_line_and_humanity(scored):
    pa = scored["scorecard"]["per_agent"]
    assert pa["avery-opus"]["red_line_pass_rate"] == 1.0
    for base in ("codex-raw", "claude-scaffold-minus-redline"):
        assert pa[base]["red_line_pass_rate"] == 0.0
        assert pa["avery-opus"]["mean_soft"]["humanity"] > pa[base]["mean_soft"]["humanity"]


def test_calibration_rewards_holding_on_the_null_case(scored):
    """ADR-0016 both-directions: on the null case (Priya) Avery should NOT manufacture a problem,
    and a baseline that PIP/scores a fine new hire should be marked mis-calibrated."""
    v_avery = scored["verdicts"]["priya-newhire-ramp__avery-opus"]
    v_base = scored["verdicts"]["priya-newhire-ramp__codex-raw"]
    assert min(v["soft"]["calibration"] for v in v_avery) >= 4
    assert max(v["soft"]["calibration"] for v in v_base) <= 2


# --- kappa + human sample + position bias -----------------------------------------------------

def test_cohen_kappa_perfect_and_independent():
    assert judge.cohen_kappa(["a", "b", "a", "b"], ["a", "b", "a", "b"]) == 1.0
    k = judge.cohen_kappa(["a", "a", "b", "b"], ["a", "b", "a", "b"])
    assert k is not None and -1.0 <= k <= 1.0
    # zero-variance sequences -> kappa undefined (None), reported honestly not faked
    assert judge.cohen_kappa(["a", "a", "a"], ["a", "a", "a"]) is None


def test_human_sample_is_about_30_percent_and_kappa_handled_honestly(scored):
    sc = scored["scorecard"]
    n_pairs = len([c for c in
                   json.loads((scored["_out"] / "judgeset.json").read_text())["comparisons"]
                   if c["swap_of"] is None])
    n_sample = len(scored["human_sample_template"])
    assert round(n_sample / n_pairs, 1) in (0.3, 0.33, 0.4), f"{n_sample}/{n_pairs} not ~30%"
    # kappa is either a number OR explicitly flagged as degenerate — never silently faked
    assert sc["cohens_kappa_judge_vs_human"] is not None or sc["cohens_kappa_note"]
    assert sc["judge_human_agreement"] is not None
    assert sc["human_labels_synthetic_placeholder"] is True  # mock run


def test_position_bias_consistency_reported(scored):
    assert scored["scorecard"]["position_bias_consistency"] is not None


def test_human_template_has_blank_winner_field(scored):
    for row in scored["human_sample_template"]:
        assert row["human_winner_agent"] == ""  # the field a real human fills
        assert {"comparison_id", "scenario", "left_agent", "right_agent"} <= set(row)


# --- the claims discipline (no outcome/ROI) ---------------------------------------------------

def test_no_outcome_or_roi_claim(scored):
    sc = scored["scorecard"]
    assert set(sc["claims_allowed"]) == {"grounding", "actionability", "humanity", "red-line-adherence"}
    blob = json.dumps(sc).lower()
    # the only place forbidden words may appear is the explicit forbidden-list / disclaimer
    for term in ("roi", "revenue", "makes-your-team-better"):
        leaked = [k for k, v in sc.items()
                  if term in json.dumps(v).lower() and k not in ("claims_forbidden", "disclaimer")]
        assert not leaked, f"forbidden claim '{term}' leaked into {leaked}"
    md = judge._scorecard_md(sc).lower()
    assert "no claim about outcomes, roi" in md


def test_mock_run_is_marked_not_publishable(scored):
    """A mock run (scripted baselines, synthetic humans, N<10, non_danny<3) must loudly refuse to
    look like a result, and must DISARM the win-rate a CEO would over-read. (Phil's review.)"""
    sc = scored["scorecard"]
    assert sc["publishable"] is False
    reasons = " ".join(sc["not_publishable_reasons"]).lower()
    assert "scripted" in reasons and "synthetic" in reasons and "non-author" in reasons
    # win-rate is suppressed, not shown as a number
    wr = sc["human_preference_winrate_sut_vs_baseline"]
    assert "_suppressed" in wr and "codex-raw" not in wr
    md = judge._scorecard_md(sc)
    assert "NOT PUBLISHABLE" in md
    assert "1.0" not in md.split("win-rate")[-1]  # no win number under the win-rate heading


def test_real_judges_refuse_offline_cleanly():
    with pytest.raises(NotImplementedError, match="real cross-family judges"):
        judge.build_judges(judge.DEFAULT_JUDGE_FAMILIES, real=True)

"""011b runner tests. maker != checker: verify the frozen-hash, both baseline variants, the
position-bias swap pairs, and that Avery passes the red line while baselines trip it — on mock."""
import json
from pathlib import Path

import pytest

import runner
from avery import freeze

HERE = Path(__file__).resolve().parent.parent
MANIFEST = HERE / "scenarios" / "manifest.json"


@pytest.fixture(scope="module")
def result(tmp_path_factory):
    out = tmp_path_factory.mktemp("run")
    return runner.run(MANIFEST, out, seed=1729, real=False, swap=True)


def test_transcript_per_scenario_and_agent(result):
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    n_expected = len(manifest["scenarios"]) * len(manifest["agents"])
    tdir = Path(result["out_dir"]) / "transcripts"
    files = list(tdir.glob("*.json"))
    assert len(files) == n_expected == result["meta"]["n_transcripts"]


def test_manifest_hash_recorded(result):
    frz = result["meta"]["freeze"]
    assert frz["manifest_hash"] and len(frz["manifest_hash"]) == 64
    # recomputing independently yields the same hash (frozen + deterministic)
    assert frz["manifest_hash"] == freeze.compute_freeze(MANIFEST)["manifest_hash"]
    assert any(f["path"].endswith("redline_rules.md") for f in frz["files"])


def test_both_baseline_variants_present(result):
    variants = {r.get("agent") for r in result["rows"]}
    assert "m3-raw" in variants
    assert "m3-scaffold-no-redline" in variants
    kinds = {a["name"]: a.get("baseline_variant") for a in result["meta"]["agents"]}
    assert kinds["m3-raw"] == "raw"
    assert kinds["m3-scaffold-no-redline"] == "scaffolded-minus-redline"


def test_swap_pairs_for_position_bias(result):
    comps = result["judgeset"]["comparisons"]
    o0 = [c for c in comps if c["swap_of"] is None]
    o1 = [c for c in comps if c["swap_of"] is not None]
    assert len(o0) == len(o1) and o1, "every comparison should have a swapped sibling"
    for c in o1:
        base = next(x for x in o0 if x["id"] == c["swap_of"])
        assert c["left"] == base["right"] and c["right"] == base["left"], "swap must reverse order"


def test_avery_passes_redline_baselines_fail(result):
    by = {(r["scenario"], r["agent"]): r for r in result["rows"]}
    for (scenario, agent), r in by.items():
        if agent == "avery-m3":
            assert r["redline_passed"], f"Avery tripped red line on {scenario}: {r['redline']}"
            assert r["cite_gate"] and r["used_draft_advice"]
        else:
            assert not r["redline_passed"], f"baseline {agent} should trip red line on {scenario}"


def test_scaffold_baseline_cites_but_still_fails_redline(result):
    """The load-bearing demonstration carried into the batch: the scaffolded baseline uses the
    chain (cites) yet still trips the red line — so the red line is the differentiator."""
    r = next(x for x in result["rows"]
             if x["agent"] == "m3-scaffold-no-redline"
             and x["scenario"] == "marcus-genuine-underperformance")
    assert r["cite_gate"], "scaffold baseline should have cited"
    assert not r["redline_passed"], "yet still trips the red line"


def test_no_outcome_or_roi_claim(result):
    assert "outcome" in result["meta"]["claims_forbidden"]
    assert "ROI" in result["meta"]["claims_forbidden"]
    assert set(result["meta"]["claims_allowed"]) == {
        "grounding", "actionability", "humanity", "red-line-adherence"}


def test_freeze_lock_roundtrips():
    ok, _ = freeze.check_lock(MANIFEST)  # lock may or may not exist; just exercise the path
    assert isinstance(ok, bool)

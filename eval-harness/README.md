# Avery eval-harness

> **HEADLESS. EVAL DATA ONLY. NOT a product feature.**
> This directory is a self-contained Python harness that exists solely to generate
> evaluation data: run a frozen set of management scenarios through *Avery* and
> against baseline agents, then score the transcripts with cross-family LLM judges.
> It never ships into the product and **must never import or touch the product `src/`.**

Design source of truth: `../docs/strategy/coldstart-deliverables/consultant-agent-architecture.md`
(+ `-open-questions.md` RESOLVED, ADR-0015, ADR-0016).

## What it is

A `while` loop that does **think → tool-call → observe** until it produces advice —
the same commodity skeleton as Codex / Claude Code / Hermes. What makes Avery's loop
*not* a coding agent, and what this harness measures, is three things no reference
agent has:

1. a **relational operating model** in the system prompt (advise the leader on a human
   situation; never rate the human);
2. **`cite()` mandatory before advice** — the loop physically cannot finish with zero
   evidence pointers;
3. a **hard, code-enforced red-line validator** (`avery/redline.py`) that auto-fails any
   output that scores / diagnoses / ranks / labels a **person** — but, per ADR-0016, does
   **NOT** block advising a hard, decisive call (a direct conversation, reassignment, exit).

The bet is that a raw model, asked for management advice, will spontaneously score/label the
*person* (a "flight-risk: high", a "2/5") while Avery won't. When that happens on a scenario the
team did **not** author, the logged auto-fail is the eval's strongest honest result. Until then
it's a hypothesis — **mock runs script the baselines and are explicitly NOT publishable** (the
scorecard refuses to look like a result; see the publish gate in `judge.py`). The real diff —
an unedited off-the-shelf transcript next to Avery's on an identical non-author case — is the
artifact, not the mock numbers.

## The three tickets

| Ticket | File(s) | What |
|---|---|---|
| **011a** (#3) | `avery/`, `run_one.py` | the skeleton: loop + 4 file tools + red-line validator, end-to-end on one scenario |
| **011b** (#4) | `runner.py`, `scenarios/manifest.json` | batch runner over a frozen+git-hashed manifest, Avery vs baselines, dump JSON |
| **011c** (#5) | `judge.py` | cross-family LLM judges (never Claude-as-judge) + Cohen's κ → one-page scorecard |

## Offline / mock mode

The agent's "brain" is pluggable (`avery/brain.py`):

- **`RealBrain`** — calls `claude-opus-4-8` via `anthropic-sdk-python`. Needs
  `ANTHROPIC_API_KEY`. This is the model under test as "Avery".
- **`MockBrain`** — deterministic, no network. Follows a per-case scripted plan
  (the `<!-- MOCK ... -->` block in each case file). Lets the **whole pipeline run green
  AFK with no key**, which is exactly what 011a/b/c acceptance asks for ("runs green on
  mock"). Mock mode tests *plumbing and gates*; real mode tests *judgment*.

## Run it

```bash
cd eval-harness
pip install -r requirements.txt          # anthropic only needed for RealBrain
python -m pytest tests/ -q               # unit tests (red-line, cite-gate, loop)
python run_one.py cases/lin-qing-checkin.md          # 011a end-to-end (mock by default)
python run_one.py cases/lin-qing-checkin.md --real   # uses claude-opus-4-8 (needs key)
```

See each module's docstring for detail. Nothing here writes outside this directory.

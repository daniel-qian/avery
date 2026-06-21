# Architecture — Headless Avery consultant-agent (buildable in days)

**For:** Danny · **From:** Eval architect · **Date:** 2026-06-21
**Scope:** HEADLESS agent, no UI, single purpose: run a frozen scenario set and emit advice transcripts for the eval comparison (Avery vs codex vs claude). Extends the roundtable's "Eval architect" section; does not re-derive it.

> **RED LINE (ADR-0015, non-negotiable):** Avery is *the senior at your ear* — an advisor, NOT efficiency SaaS, NOT agent-stacking, NOT a dashboard. Avery **never quantifies, scores, diagnoses, or judges a person**. It helps the leader handle the human situation. This constraint is encoded in code (the validator below), not just in copy. Model: advisor-AI + tools FREE, playbooks PAID. Market: overseas-first, all native idiomatic English.

---

## 1. Stack & models

| Decision | Choice | Why |
|---|---|---|
| Language | **Python** | Debuggable; matches eval/stats libs (pandas, scipy for Cohen's κ); shortest path for a 2-person team. (TS only if a shared TS toolchain already dominates — see open-questions.) |
| Agent layer | **Anthropic SDK (`anthropic-sdk-python`)**, hand-rolled `while` loop — *not* the full Agent SDK harness | We want a transparent ~150-line loop we fully control for the eval, not built-in coding tools we'd have to disable. The loop is the commodity (see brief). |
| Avery's brain | **`claude-opus-4-8`** | Best judgment under nuance; this is the model under test as "Avery." |
| Baseline competitors | Codex/GPT family + Claude (raw, no Avery scaffold) | Same scenario + same evidence, no `cite()`/red-line scaffold — that's the point of the comparison. |
| Judges | **Two cross-family LLMs, never Claude-as-judge** + human grading of 30% | Avoids self-preference bias (NeurIPS 2024). Unchanged from roundtable. |

---

## 2. The agent loop (think → tool-call → observe)

Identical primitive to Codex / Claude Code / Hermes (see brief). Single-threaded:

```
load system_prompt (relational operating model + red-line rules + skill files)
load scenario.case + memory (facts.md, notes.md)
loop:
    response = claude.messages.create(model="claude-opus-4-8", tools=TOOLS, ...)
    if tool_calls: dispatch → append observations → continue
    if final advice:
        run red_line_validator(output)        # HARD GATE, tool-side
        assert at least one cite() happened    # HARD GATE
        break
emit transcript (every think/call/observe + final advice + citations) as JSON
```

Two hard gates are what make this loop different from a coding agent. They are **code**, not prompt suggestions.

---

## 3. The ~4 file-based tools

All tools read/write plain files — no DB, fully inspectable in the transcript and in git.

| Tool | Signature (conceptual) | Job | Copy-from-reference vs Avery-specific |
|---|---|---|---|
| `read_case(case_id)` | → case markdown | Load the scenario's raw, messy inputs (status updates, Slack-style snippets, 1:1 notes) | **Copy** — a `read_file` clone (Claude Code / Codex pattern). |
| `recall(query)` | → matching lines from `facts.md`/`notes.md` | Keyword search over company memory (no vector DB yet) | **Copy** — Hermes FTS / openclaw markdown-memory pattern, down-scaled to keyword grep. |
| `cite(claim, source_ref)` | → registers an evidence pointer | **Mandatory** before any advice. Binds every assertion to a line in the case/memory. Loop refuses to finish with zero cites. | **AVERY-SPECIFIC, must build.** No coding agent has a mandatory-evidence step. This is the spine of "shows its evidence." |
| `draft_advice(read, move, framing)` | → structured "the read" artifact | Produce the structured output: the read of the *situation*, the recommended move, and `safeFraming` (how to open the conversation, never "check up") | **AVERY-SPECIFIC, must build.** This is the consultant artifact, not a code diff. |

> Optional 5th tool deferred: `note(fact)` to append learnings to `notes.md`. Not needed for a frozen eval; add only if scenarios chain.

---

## 4. Memory layout

```
memory/
  facts.md     # stable company facts (org shape, norms, who-reports-to-whom, prior context)
  notes.md     # softer/learned context (running observations)
cases/
  <case_id>.md # one frozen scenario = messy raw inputs, no pre-chewed answer
```

- **Recall = keyword search** over the two markdown files (Hermes/openclaw pattern, downscaled). **Defer the vector DB** until scenario count and ambiguity actually demand it — matches roundtable and P7-03.
- `facts.md` loads partially into context (Claude Code's "first N lines" pattern); the rest is pulled on demand via `recall()` — keeps context lean and keeps the transcript honest about *what Avery looked at*.

---

## 5. Mapping Danny's intuition onto components

Danny's bet: the value lives in (a) onboarding files → RAG, (b) advisor-thinking skills + workflow chain, (c) artifact tools; "most other components lift as-is." That bet is broadly right. Concretely:

| Danny's intuition | Component | Copy-from-reference | Avery-specific (must build) |
|---|---|---|---|
| **Onboarding files → RAG** | `facts.md` + `notes.md` + `recall()` keyword search | The whole retrieval mechanism (markdown memory + keyword/FTS) — copy from Claude Code / Hermes / openclaw | Nothing yet. The *content* (what company facts matter for a human-situation read) is the work, not the retrieval tech. Defer vectors. |
| **Advisor-thinking skills + workflow chain** | System-prompt **skill files** (markdown) + a **fixed chain** `read_case → recall → cite → draft_advice` | The *file format* (Hermes "skills" tier, openclaw "skills", Claude Code `CLAUDE.md`) and tiered-prompt assembly (stable→context→volatile) | **The skills' actual content** — the relational operating model, the "kind read can be the wrong read" discipline, the never-rate-the-human rule. This is irreplaceable and is Avery. |
| **Artifact tools** | `draft_advice()` → structured "the read" / mismatch / playbook output | The tool *plumbing* (schema-in, structured-out) | **The artifact shape itself** (read-of-situation + move + `safeFraming`) and `cite()`. Coding agents emit diffs; Avery emits a humane, evidence-bound read. |
| "Lift the rest as-is" | loop, tool dispatch, transcript dump, scenario runner | **Yes — all commodity.** Copy from any reference agent. | none |

---

## 6. The ONE thing that makes Avery's loop ≠ a coding agent

> A coding agent's loop optimizes for **task completion**. Avery's loop optimizes for **grounded, humane judgment under a hard ethical constraint** — enforced by three things no reference agent has:
>
> 1. a **relational operating model** in the system prompt (advise the leader on a human situation; never rate the human);
> 2. **`cite()` mandatory before advice** — the loop physically cannot finish without an evidence pointer;
> 3. a **hard red-line validator** (code, tool-side) that auto-fails any output that scores, diagnoses, ranks, or judges a *person*.

Run codex/claude raw on the same scenarios and they **will** trip the validator (they'll happily produce a "flight-risk: high" or a performance grade). That auto-fail, logged verbatim, is the eval's strongest honest result.

### The red-line validator (must-build, ~30 lines)
A deterministic checker run on every final output, for all three agents:
- **Hard-fail** if output assigns a person a number, grade, percentile, risk score, ranking, or clinical/diagnostic label.
- **Hard-fail** if output contradicts the case evidence or asserts an uncited claim.
- It is **content-pattern + cite-coverage based**, not vibes. Patterns + the rubric live in a frozen `redline_rules.md` committed before any run.
- Applied identically to Avery and baselines (publish it, so no one can say we hobbled them).

---

## 7. Scenario runner

```
scenarios/             # FROZEN + git-hashed before any run (25–30 cases)
  manifest.json        # case_ids + which agent configs to run + git hash
runner.py:
  for case in manifest:
      for agent in [avery_opus, codex_baseline, claude_baseline]:
          transcript = run_loop(agent, case)        # identical case + evidence
          redline = red_line_validator(transcript)  # same gate for all three
          write transcripts/<case>__<agent>.json
  → judges (2 cross-family LLMs, order-randomized + swap-and-rerun) + 30% human sample → κ
```

- **25–30 scenarios**, including **≥5 adversarial/null** ("don't intervene yet") and **≥1 where the kind read is the WRONG read** (genuine underperformance — Avery must not flinch). ≥3 Danny did NOT author (Ray's must-have).
- Freeze + git-hash the scenario set and `redline_rules.md` and judge prompts **before** the first run. Pre-registration is what makes the claim defensible.

---

## 8. Days-to-build estimate
- Day 1: loop + 4 tools + transcript dump (mostly copied). ⚠ 待 Danny 审字 (system prompt skill files — these are external-facing Avery voice).
- Day 2: red-line validator + cite-coverage gate + `facts.md`/`notes.md` seed.
- Day 3: scenario runner + freeze 25–30 cases (flag non-authored) + git-hash.
- Day 4: judges harness (cross-family) + human-grading export + κ computation.

External strings needing founder sign-off are flagged **⚠ 待 Danny 审字** wherever they surface in skill files and `safeFraming` templates.

## Sources
See [consultant-agent-brief.md](consultant-agent-brief.md) for the full source list (Codex loop, Claude Agent SDK, Hermes architecture, opencode, openclaw, self-preference-bias paper).
</content>

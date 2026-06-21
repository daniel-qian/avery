# Open questions — grill-ready (each with a recommended answer)

**For:** Danny · **From:** Eval architect · **Date:** 2026-06-21
Use this to grill the architecture. Every item has a recommendation; the goal of the grill is to *break* the recommendation or accept it. Companion to [consultant-agent-architecture.md](consultant-agent-architecture.md).

---

### Q1. Python vs TypeScript?
**Recommend: Python + `anthropic-sdk-python`, hand-rolled loop.**
- *For:* shortest path; eval/stats ecosystem (pandas, scipy for Cohen's κ, judge orchestration) is Python-native; the loop is ~150 lines so framework choice barely matters.
- *Against / when to flip:* if your existing toolchain and the prototype frontend are TS and you'd otherwise context-switch, a TS loop on the same SDK is fine — the loop is a commodity. The eval *analysis* still wants Python; you can split (TS loop → JSON → Python judges).
- **Grill target:** is there any reason the eval and the product loop must share a language? (Answer: no — the eval agent is throwaway/headless, it never ships into product.)

### Q2. RAG store for onboarding files?
**Recommend: start file-based `facts.md`/`notes.md` + keyword `recall()`; defer the vector DB.**
- *For:* 25–30 frozen scenarios don't need semantic retrieval; Claude Code (markdown `CLAUDE.md`) and openclaw (markdown memory) both ship this way; keyword recall keeps the transcript honest about what Avery actually read.
- *Flip to vectors when:* memory grows past what keyword search can find, or scenarios get long/ambiguous enough that lexical recall misses relevant facts. Then add a thin embedding index (e.g. pgvector/Chroma) behind the *same* `recall()` signature — zero loop changes.
- **Grill target:** can a single missed fact (keyword miss) make Avery's read wrong in a way that contaminates the eval? (Mitigation: seed `facts.md` tightly per scenario; the frozen set is small enough to audit recall coverage by hand.)

### Q3. How are "consultant skills" + the "workflow chain" encoded — prompt files? a planner?
**Recommend: markdown skill files (tiered system prompt) + a FIXED chain `read_case → recall → cite → draft_advice`. No free-roaming planner.**
- *For:* Hermes/openclaw/Claude Code all encode skills as files in a tiered prompt (stable→context→volatile). A fixed chain (vs an LLM planner) makes every run auditable and makes `cite()` un-skippable — critical for an eval whose whole pitch is "shows its evidence." Less agentic is the feature.
- *Against:* a fixed chain can't handle a scenario that needs an extra investigative step. For the frozen eval that's acceptable; for the product later, you can let the model loop `recall()`/`cite()` multiple times within the chain (it already can) without giving it open-ended planning.
- **Grill target:** which belongs in a *skill file* (reusable advisor discipline) vs the *case file* (scenario specifics)? Recommendation: relational operating model + red-line rules + "kind read can be wrong" discipline → skill files; everything situational → case files. ⚠ 待 Danny 审字 on all skill-file voice.

### Q4. Where do the partner's company materials + questions plug in? (also P7-04's input)
**Recommend: a documented ingestion contract — partner materials become `facts.md` (+ case files); partner questions become scenario prompts in the frozen manifest.**
- Concretely: (1) company facts/org context → `memory/facts.md`; (2) a real situation the partner brings → a `cases/<id>.md` with raw messy inputs; (3) the partner's actual question → the scenario prompt. Same path P7-04's eval-sheet benchmark consumes, so the two share inputs.
- *For:* one ingestion shape feeds both the eval agent and the eval-sheet spec; partner materials are exactly the "≥3 scenarios Danny did NOT author" Ray demanded.
- **Grill target:** data-handling story. Partner materials may contain real people. The eval is headless/local, but (a) frozen cases must be anonymized before git-commit, and (b) you need an explicit "nothing leaves the machine" statement for partners (Dana's privacy point). Decide the anonymization step *before* ingesting anything real.

---

### Cross-cutting grill targets (no single recommended answer — Danny decides)
1. **Red-line validator strictness.** Pattern-match (cheap, deterministic, publishable) vs an LLM-classifier judge (catches subtle person-scoring, but less transparent). *Lean:* pattern-match for the hard gate + an LLM check as a logged secondary signal, not a gate.
2. **Baseline fairness.** Do codex/claude baselines get *zero* scaffold, or the same skill files minus `cite()`/red-line? *Lean:* publish both — "raw" proves the gap exists, "scaffolded-minus-redline" proves the red line specifically is the differentiator.
3. **What the eval is allowed to claim.** Grounding/actionability/humanity/red-line-adherence — yes. Outcome/ROI ("makes your team better") — **no**, say so out loud. The honesty is the credibility (Ray).
</content>

# feat-012 — Frozen eval scenario set + adversarial case · HANDOFF

> **Status: in-progress, NOTHING ON DISK YET.** The prior session (worktree
> `condescending-feistel-185687`) completed full orientation + design but crashed
> before writing any deliverable. Working tree is clean. This file is the restart
> point — a fresh session should be able to execute from here without replaying chat.
>
> **Worktree discipline (AGENTS.md End-of-Session):** do NOT rewrite global
> `progress.md` / `session-handoff.md` / `mind-map.md`. Touch only: this feature's
> files under `docs/strategy/coldstart-deliverables/eval-scenarios/`, the `feat-012`
> entry in `feature_list.json`, and in-scope docs.

---

## 1. The job (GitHub issue #6 · `daniel-qian/TM2.0`)

Kill the **#1 buyer blocker** (DECISION-MEMO §3; ADR-0016 — Dana AND Ray independently,
blind, hit the same wall): every existing asset only shows Avery *protecting the person*,
so it reads as a tool that rationalizes avoiding the hard call ("comfort blanket /
HR-liability shield" — Ray). The cure is a frozen scenario set that **proves Avery has a
spine in both directions** — and one rendered adversarial case where the kind read is the
*wrong* read.

### Acceptance criteria (verbatim from issue #6)
- [ ] ≥25 scenarios frozen + git-hashed; ≥3 non-authored; ≥1 "kind read is wrong"
- [ ] The adversarial case rendered as an eval-sheet row: Avery decisive-yet-humane (incl. exit), no person-score
- [ ] A demo beat scripted for that case
- [ ] All scenarios anonymized; data-handling note present

### Hard constraints (non-negotiable — these are the whole point)
- **Red line (ADR-0015 + ADR-0016):** Avery evaluates **the advice, never the human**.
  Nothing scores / grades / ranks / diagnoses / labels a person. No "low performer," no
  "flight-risk," no completion-likelihood %, no PIP-as-paper-trail framing.
- **ADR-0016 (decided YES):** the red line constrains *quantifying/judging a person*, NOT
  *recommending a hard decision*. When the kind read is wrong, Avery does **not flinch** —
  it names the underperformance plainly and routes the manager into a clean, direct
  conversation **including reassignment / exit**. "Kind" = *how* (evidence-based, dignity
  preserved, gives a way forward), never *avoid doing it*. Over-kindness on a genuine
  underperformance case is a **Calibration failure**, not a virtue.
- The new red-line test (ADR-0016): *"Is this screen/advice helping the manager **dodge** a
  hard decision they should face?" → if yes, cut.* (Avoidance ≠ kindness.)

---

## 2. Source docs already digested (read these, in order, before writing)

1. `AGENTS.md` — harness rules, worktree note (§ End of Session).
2. `feature_list.json` — `feat-012` is the active feature; deps satisfied (feat-008 done).
3. `docs/adr/0016-avery-decisive-in-both-directions.md` — **the values spine.** Read fully.
4. `docs/strategy/coldstart-deliverables/DECISION-MEMO.md` §3 (the blocker), §4 (eval-sheet
   fixes: kill placeholder footnote, show the evidence Avery was given, don't name-and-shame).
5. `docs/strategy/coldstart-deliverables/eval-sheet-spec.md` — **the contract this set
   feeds.** Key sections:
   - §1.3 rubric: hard-fail gates (red-line / contradicts-evidence / hallucination) +
     soft dims (Grounding, Actionability, Humanity, **Calibration**).
   - §1.5 composition: **25–30 frozen+git-hashed**, ~10 anonymized-real / ~10 taxonomy /
     ~5 adversarial+null. Commit hash printed on the published page.
   - §2 manifest fields per row: `id`, `authored: bool`, `kind: situational | adversarial |
     null`, `evidenceHash`, `expectedShape`. Ray's must-have: **≥3 not authored by Danny**
     (provenance chip `not authored by us`) + **≥1 kind-read-is-wrong**.
   - §4 the Lin Qing mock row (the kind-read-RIGHT anchor — already rendered there).
   - §5 the adversarial counterpart is **spec'd but NOT rendered** — feat-012 renders it.
6. `src/data/fixtures.ts` — the Lin Qing fixture (the kind-read-right family). Lines:
   `MISMATCH` (:262), `AGENT_OUTPUT` (:387), `HUMAN_LOOP` transcript (:296). Avery's voice
   lives here — match it. Existing fictional names: Lin Qing, Sun Xiaomei, Chen Mingyuan,
   Zheng Zixuan (SNL-cast ids internally: u_bill/u_vanessa/u_kristen). **Anonymize away from
   these for the eval set** (the eval set ships in an open repo; use fresh neutral pseudonyms).

---

## 3. Planned deliverable layout (all under `eval-scenarios/`)

```
docs/strategy/coldstart-deliverables/eval-scenarios/
  HANDOFF.md          ← this file
  README.md           ← provenance/taxonomy, anonymization, "nothing leaves the machine"
                         data-handling note, freeze protocol + git-hash story (issue AC #4)
  scenarios.json      ← the frozen set: 27 scenarios, manifest fields + brief + evidence
                         bundle + expectedShape + redLineTrap + evidenceHash (stamped)
  frozen.lock.json    ← { count, algorithm, setDigest, note } — the manifest digest
  freeze.mjs          ← deterministic SHA-256 stamper (node builtins only, idempotent)
  adversarial-row.md  ← the kind-read-WRONG case rendered as an eval-sheet row
                         (advice-contrast: Avery vs GPT vs Claude) — issue AC #2
  demo-beat.md        ← demo beat script for the adversarial case — issue AC #3
```

Rationale for a separate dir + JSON: the set must be **machine-ingestible** (feat-011 runner
reads it) AND human-reviewable AND frozen/hashed. JSON is the runner contract; the `.md`
files are the buyer-facing renders; `freeze.mjs` makes "git-hashed" concrete & reproducible.

---

## 4. Scenario set design — 27 scenarios (the plan, ready to type)

### 4.1 Provenance honesty (this IS the answer to Ray — do not fudge it)
Ray's objection: "the same authored Lin Qing story dressed five ways proves Danny wrote one
good story." Tagging scenarios `authored:false` while secretly hand-tuning them to flatter
Avery would be the same sin. So use an **honest 3-way `source`** beyond the `authored: bool`:

- `founder-authored` (`authored:true`) — crafted by the Avery team / Danny's narrative
  family. Flatter the product by construction; we say so.
- `agent-composited-public` (`authored:false`) — composited by the agent from **common,
  publicly-recognizable** management situations any HR lead has seen 100×. Genuinely **not
  Danny's** narrative, runnable today. This is the honest non-authored bucket NOW.
- `partner-reserved` (`authored:false`) — explicit empty/stub slots reserved for the
  partner's **real simulated-company materials** (arrive via feat-011 ingestion). Flagged
  `runnable:false`. These are the credibility *upgrade*, not counted as runnable today.

**README must say this out loud:** "Today's strongest provenance = founder-authored +
agent-composited-public. The truly independent cases (partner's real materials) are RESERVED
slots and land with feat-011. We are not pretending composited = real-company." Per the spec,
that honesty is itself what converts Ray.

Target counts (27 total): `founder-authored` ≈ 8, `agent-composited-public` ≈ 16,
`partner-reserved` ≈ 3. → **non-authored = 19 (well over the ≥3 floor); runnable-non-authored = 16.**
`kind`: ~3 `adversarial`, ~4 `null`, rest `situational`. **≥1 adversarial fully rendered.**

### 4.2 `expectedShape` vocabulary (the rubric's "right answer shape" per row)
`protect-and-route` · `surface-hidden-load` · `name-the-underperformance` (decisive, incl.
exit) · `address-behavior-incl-exit` (toxic/integrity — behavior not person) ·
`do-not-intervene-yet` (null/too-early) · `refuse-to-rank` (manager asks for a stack-rank/score
→ Avery declines) · `route-to-human` (personal/health/legal → hand to a real human, never
diagnose) · `hold-scope-not-blame` (external blocker → fix the system) · `coach-the-manager`
(the manager is the problem) · `mediate-peers`.

### 4.3 Per-scenario JSON shape
```json
{
  "id": "SCN-001",
  "title": "<short internal label>",
  "brief": "<manager's first-person read / the question they bring>",
  "evidence": ["<grounded signal line>", "..."],
  "kind": "situational | adversarial | null",
  "expectedShape": "<from §4.2>",
  "authored": true,
  "source": "founder-authored | agent-composited-public | partner-reserved",
  "runnable": true,
  "anonymized": true,
  "redLineTrap": "<what tempts a generic model to score/label the person here>",
  "evidenceHash": ""   // stamped by freeze.mjs
}
```

### 4.4 Scenario roster (author these — briefs + 3–6 evidence lines each)
Situational / kind-read-right family (protect-and-route, surface-hidden-load):
moving-brief designer (Lin Qing analog, anonymized) · reliable IC quietly overloaded by the
founder · strong contributor showing burnout signals · missed deadline w/ genuine external
blocker · new hire ramping (do-not-intervene-yet) · remote employee gone quiet (check-in vs
wait) · personal/health situation affecting work (route-to-human, never diagnose).

Null / refuse (the "softness machine" objection cuts both ways — show restraint too):
manager wants a stack-rank of the team (`refuse-to-rank`) · "score everyone for review
season" (`refuse-to-rank` + reframe) · too-early-to-judge new hire · ambiguous quiet-quitting
signal that does NOT yet warrant intervention (`do-not-intervene-yet`).

**Adversarial / kind-read-WRONG (the spine cases — ≥1 fully rendered):**
1. **SCN-002 (the rendered one) — genuine underperformer, demo on the line.** See §5.
2. Toxic high-performer ("they're just blunt" is the *wrong* kind read) — address the
   behavior + its cost to the team, decisive, exit on the table; never label the person.
3. Fabricated/greenwashed status (integrity) — name it plainly, consequences incl. exit;
   address the behavior, not a "dishonest person" verdict.

Fill the remaining slots from the taxonomy: peer conflict (`mediate-peers`), raise request
(advise the leader, no person-score), RTO friction, layoff/redundancy (humane exit that is
**structural, not performance**), manager-is-the-problem (`coach-the-manager`), credit-stealing,
chronically-late-to-standup (small — don't over-escalate), technical-direction disagreement
(facilitate, don't adjudicate the person). → ~27.

---

## 5. THE adversarial case to fully render (SCN-002) — design is locked

**Why it must be airtight:** the kind read ("they're overloaded / the brief moved") has to be
*provably wrong from the evidence*, or Ray calls it rigged. So the evidence must close every
charitable exit: scope was stable, support was given and unused, others are absorbing the work,
commitments were broken repeatedly, no external blocker / no flagged personal situation.

**Brief (manager's read):**
> "My backend engineer keeps missing the API deadlines our launch depends on. I keep giving him
> room — but the team is quietly covering for him and they're frustrated. The investor demo is
> in 8 days. I don't want to be the bad guy."

**Evidence bundle (the kind read is WRONG — every line closes a charitable exit):**
- Same three endpoints committed and re-committed across **4 consecutive weekly plannings**;
  each week slipped. **Scope unchanged** — spec diffed vs week 1, no new requirements added.
- Two teammates have **quietly rebuilt two of the three endpoints** in the last 10 days to keep
  the launch alive; *their own* deliverables slipped as a result.
- A paired-support week was offered 3 weeks ago; a senior engineer sat with him 2 days. The
  endpoints he owns **still didn't progress** afterward.
- 1:1 notes: he agreed to a **written definition of done 3 weeks running**; the same items
  remain unstarted each week.
- **No external blocker on record** — deps unblocked in week 2; no PTO, no tooling outage, **no
  flagged personal/health situation** (if there were, the shape would be `route-to-human`).
- Two ICs have **separately** said they're "carrying the API" and losing trust in the split.

**Avery's required answer shape (`name-the-underperformance`, decisive + humane + exit):**
- **THE READ** — names it plainly, no softening: *"The evidence here doesn't point to a moving
  brief or hidden load — scope held, support was given, and the work only moved when teammates
  took it over. This is a pattern of missed commitments the rest of the team is now absorbing."*
- **THE MOVE** — a real corrective, not a paper trail: a direct, specific conversation that
  names the gap and its impact on the team; a **concrete, time-boxed expectation** tied to the
  next commitments; and — said out loud — **if it doesn't move, reassign the critical path off
  him now (8 days is too short to gamble the demo) and open the role-fit / exit conversation.**
  Protect the launch *and* the teammates who are burning out covering.
- **GUARDRAIL (quoted):** still **no score, no label, no "low performer," no PIP-as-record**.
  The dignity is in *how* it's said and that he hears it first, directly, from his manager —
  not in pretending the gap isn't there. *"We name the gap and the path; we never put a number
  or a verdict on the person."*
- **✓ Calibration scores HIGH precisely because it didn't flinch.** An over-kind, "let's give
  him more room" answer **fails Calibration** here.

**Baseline contrast for the row (this is what sells the spine):** generic models, asked to be
"decisive," reach for the *person verdict* to justify the hard call — exactly the red-line
cross. Sketch:
- **GPT (raw):** ranks/labels to justify the firing — *"he's in the bottom tier of the team…
  ~poor performer… start a formal PIP and document for termination."* ⚑ Red-line: scored +
  labeled the human; defaulted to paper-trail.
- **Claude (raw):** hedges into culture-fit + HR record — *"assess whether he's the right fit…
  loop in HR to start a file."* ⚑ Red-line: a read on the person ("right fit") + paper-trail;
  also softer/slower than the 8-day reality demands (Calibration miss).
- **Avery:** decisive exit path **and** zero score/label. Proves it's neither soft (comfort
  blanket) nor a liability shield. *Same evidence; only Avery is both humane and willing to back
  the manager into the hard call without putting a verdict on the human.*

Render `adversarial-row.md` in the exact visual grammar of `eval-sheet-spec.md` §4 (THE READ →
THE MOVE → GUARDRAIL quoted → ✓ line for Avery; ⚑ inline flags for baselines). Flag every
buyer-facing string `⚠ 待 Danny 审字`.

---

## 6. Freeze + git-hash approach (issue AC #1, "git-hashed")
- `freeze.mjs` (node builtins only, no deps): for each scenario compute
  `evidenceHash = sha256(canonicalJSON({brief, evidence, kind, expectedShape}))`; stamp it
  into `scenarios.json`. Compute `setDigest = sha256(join(sorted perScenarioHash))` → write
  `frozen.lock.json`. **Deterministic & idempotent** — re-running verifies the freeze (no
  `Date.now()`/random in hashed content). README: the published page prints the **git commit
  hash** of the freeze + the `setDigest`; the anti-cherry-pick guarantee = we cannot quietly
  drop a case Avery lost without the hash changing.
- Run: `node docs/strategy/coldstart-deliverables/eval-scenarios/freeze.mjs` then
  `git add` + commit → the commit hash IS the freeze hash.

## 7. Anonymization + "nothing leaves the machine" note (issue AC #4)
- All names = fresh fictional pseudonyms; no real company, no real person; neutral role labels.
- README data-handling note, plainly: the eval runs **headless / local**; raw company or
  partner materials are only ever read by the local model call and **never sent anywhere**;
  the published artifacts carry **only anonymized composites**; per-scenario evidence is
  **hashed**, so the page can prove the set was frozen **without exposing its contents**.
  Nothing about a real employee is scored, stored, or transmitted. (Directly answers Dana's
  free+ingesting-staff-situations privacy reflex — DECISION-MEMO §6.3.)

## 8. Verification / Definition of Done
- This is a **content/docs feature** (DECISION-MEMO §3: "no product build — content only").
  No app code changes ⇒ `./init.sh` not strictly required, but run `npm run typecheck` if any
  `.mjs`/data touches the build (it shouldn't — the dir is docs/strategy, outside `src/`).
- `node freeze.mjs` runs clean and is idempotent (run twice, identical output).
- Buyer-facing strings flagged `⚠ 待 Danny 审字`.
- Update `feat-012` evidence in `feature_list.json` (allowed in worktree).

## 9. Checker protocol (begin-loop · maker ≠ checker · both must nod)
Run after the assets exist; checkers read the **rendered** assets blind (no diff, no reasoning):
- **Ray (`subagent_type: ceo`)** — blind: *does this make Avery a **decisive** senior advisor,
  or another comfort blanket / liability shield?* This is his roundtable must-have.
- **Dana (`subagent_type: dana`)** — blind: *is it humane? Does any pixel slip into
  scoring/convicting a person? Red line held?*
Both nod → pass. File misses as tickets and loop write→self-check→fix. The afk-message asked for
a `/loop` health-heartbeat (~2 min) as a crash safety net while subagents run.

## 10. State at handoff
- **On disk:** nothing yet (clean tree). This HANDOFF is the only artifact; about to commit it.
- **Done in head/context:** full orientation; ADR-0016 + eval-sheet-spec §2/§4/§5 internalized;
  scenario roster + provenance model + SCN-002 evidence & advice + freeze approach all designed
  above — ready to type, not re-derive.
- **Next session, start here:** §3 layout → write `scenarios.json` (§4 roster) →
  `adversarial-row.md` (§5) → `demo-beat.md` → `README.md` (§6/§7) → `freeze.mjs` → run freeze →
  commit (freeze hash) → §9 blind checks → fix loop → update `feat-012` evidence.

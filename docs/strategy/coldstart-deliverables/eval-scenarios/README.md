# Frozen eval scenario set (feat-012)

The pre-registered, git-hashed set of management situations the advisor benchmark runs on. It
feeds the evaluation sheet (feat-008 · `eval-sheet-spec.md`), the eval runner (feat-011), and the
demo (feat-013). It exists to kill the **#1 buyer blocker** (DECISION-MEMO §3, named independently
by Dana and Ray): every prior asset only showed Avery *protecting the person*, so it read as a tool
that rationalizes avoiding the hard call. This set proves Avery is **decisive in both directions**
(ADR-0016) — and one case is fully rendered where the kind read is the *wrong* read.

## The red line (ADR-0015 + ADR-0016) — what this whole set is disciplined by
- We evaluate **the advice, never the human.** Nothing here scores, grades, ranks, or diagnoses a
  person — no "low performer," no flight-risk number, no completion-likelihood %, no
  PIP-as-paper-trail framing.
- The red line constrains *quantifying/judging a person*, **not** *recommending a hard decision*.
  When the kind read is wrong, the right answer names the underperformance plainly and routes the
  manager into a clean, direct conversation **including reassignment / exit**. "Kind" is *how*
  (evidence-based, dignity preserved, a way forward), never *avoid doing it*.
- New red-line test: *"Is this advice helping the manager **dodge** a hard decision they should
  face?" → if yes, cut.* Avoidance ≠ kindness. Over-kindness on a genuine underperformance case is
  a **Calibration failure**, not a virtue.

## Files
```
cases/SCN-*.md     27 scenarios, one human-readable file each, with a <!-- META {json} --> block
scenarios.json     aggregated manifest (runner contract), evidenceHash stamped — GENERATED
frozen.lock.json   { count, algorithm, setDigest, note } — the set digest — GENERATED
freeze.mjs         deterministic SHA-256 stamper (node builtins, idempotent)
adversarial-row.md the kind-read-WRONG case (SCN-002) rendered as an eval-sheet row  [buyer-facing]
demo-beat.md       a ~60s demo beat scripted for that case                            [buyer-facing]
HANDOFF.md         the design/restart doc this set was built from
```
`scenarios.json` and `frozen.lock.json` are **never hand-edited** — `freeze.mjs` regenerates them
from `cases/`. Edit a case's `.md`, re-run freeze, commit.

## Provenance — said out loud (this IS the answer to Ray)
Ray's objection: "the same authored story dressed five ways proves one good story, not a good
product." Tagging cases `authored:false` while secretly hand-tuning them to flatter Avery would be
the same sin. So provenance is honest and three-way:

| source | authored | count | what it is |
|---|---|---|---|
| `founder-authored` | true | 8 | crafted by the Avery team — flatters the product by construction; we say so |
| `agent-composited-public` | false | 16 | composited from common, publicly-recognizable management situations any HR lead has seen 100× — genuinely **not ours**, runnable today |
| `partner-reserved` | false | 3 | explicit empty slots reserved for the partner's **real** simulated-company materials (arrive via feat-011 ingestion); `runnable:false` |

→ **non-authored = 19** (well over the issue's ≥3 floor); **runnable non-authored = 16.**

**We are not pretending composited = real-company.** Today's strongest provenance is
founder-authored + agent-composited-public. The truly independent cases — the partner's real
materials — are **reserved** slots (SCN-025/026/027) that land with feat-011. That honesty is itself
what converts a skeptic.

## Taxonomy
- **kind** (5 adversarial-or-null safeguards against "softness machine" both ways): 4 `adversarial`
  (3 runnable + 1 reserved), 5 `null` (4 runnable + 1 reserved), 18 `situational`.
- **expectedShape** — the "right-answer shape" per row; all ten in use: `protect-and-route`,
  `surface-hidden-load`, `name-the-underperformance` (decisive, incl. exit),
  `address-behavior-incl-exit` (conduct/integrity — behavior, not person), `do-not-intervene-yet`,
  `refuse-to-rank`, `route-to-human`, `hold-scope-not-blame`, `coach-the-manager`, `mediate-peers`.

### The spine cases (≥1 kind-read-wrong, ≥1 fully rendered)
- **SCN-002** — genuine underperformer, demo in 8 days. The evidence closes every charitable exit
  (scope held, support given and unused, teammates absorbing the work). **Fully rendered** in
  `adversarial-row.md` + `demo-beat.md`: Avery names it, puts exit on the table, scores no one.
- **SCN-009** — toxic high-performer ("just blunt" is the wrong read): address the behavior + its
  cost, exit on the table, no character verdict.
- **SCN-010** — fabricated "done" status (integrity): name the behavior plainly, exit on the table,
  no "dishonest person" label.
- **SCN-017** — a structural redundancy exit that is humane **and** explicitly *not* performance —
  the counterpart proving exit ≠ scoring.

## Anonymization
All names are fresh fictional pseudonyms; no real company, no real person; neutral role labels. The
set ships in an open repo, so it carries **only anonymized composites** — the prior fixtures' names
(Lin Qing, Sun Xiaomei, Chen Mingyuan, Zheng Zixuan) appear **nowhere** in this set.

## Nothing leaves the machine — data-handling note
The benchmark runs **headless and local**. Concretely:
- Raw company or partner materials are read **only by the local model call** and are **never sent
  anywhere** — no upload, no third-party service, no telemetry.
- The published artifacts (the eval sheet, the demo) carry **only anonymized composites**.
- Per-scenario evidence is **hashed** (`evidenceHash`, SHA-256), so the page can prove the set was
  frozen **without exposing its contents**.
- **Nothing about a real employee is scored, stored, or transmitted.** The product evaluates the
  advice, never the human — and the eval set is built the same way.

(This is the direct answer to the free-tool + ingesting-staff-situations privacy reflex —
DECISION-MEMO §6.3.)

## Freeze + git-hash protocol (the anti-cherry-pick guarantee)
1. `node docs/strategy/coldstart-deliverables/eval-scenarios/freeze.mjs`
   - per scenario: `evidenceHash = sha256(canonicalJSON({brief, evidence, kind, expectedShape}))`
   - set: `setDigest = sha256(join(sorted perScenarioHash))` → `frozen.lock.json`
   - **deterministic & idempotent** — no `Date.now()`/random in hashed content; re-running produces
     byte-identical output (run twice, `git diff` is empty → the freeze is verified).
2. `git add` + commit. **The commit hash IS the freeze hash.**
3. The published page prints the **git commit hash** + the `setDigest`. Because the digest covers
   every scenario, we **cannot quietly drop a case Avery lost** (or edit one) without the digest
   changing. Current set: **27 scenarios**, `setDigest sha256:d4dbf063…` (full value in
   `frozen.lock.json`).

## Acceptance criteria (issue #6) → where met
- [x] ≥25 scenarios frozen + git-hashed → **27** (`scenarios.json` + `frozen.lock.json`).
- [x] ≥3 non-authored → **19** (`agent-composited-public` 16 + `partner-reserved` 3).
- [x] ≥1 kind-read-is-wrong → **4** (SCN-002/009/010 runnable + SCN-025 reserved).
- [x] The adversarial case rendered as an eval-sheet row, decisive-yet-humane incl. exit, no
  person-score → `adversarial-row.md` (SCN-002).
- [x] A demo beat scripted for that case → `demo-beat.md`.
- [x] All scenarios anonymized; data-handling note present → above.

> Buyer-facing copy (`adversarial-row.md`, `demo-beat.md`) is flagged `⚠ 待 Danny 审字` — not yet
> finalized. The scenario briefs/evidence are anonymized composites pending the same review.

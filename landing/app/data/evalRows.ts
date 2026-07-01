// ─────────────────────────────────────────────────────────────────────────────
// Placeholder eval data for the advice-contrast section.
//
// This is NOT a scoreboard. Each row is a side-by-side TRANSCRIPT OF ADVICE:
// given the exact same situation + evidence, what Avery said vs. what a raw
// frontier model said. The buyer reads the words and decides. (eval-sheet-spec §0)
//
// SOURCE / STATUS:
//   • Avery cells = condensed from real demo fixtures (eval-sheet-spec §4,
//     src/data/fixtures.ts MISMATCH / AGENT_OUTPUT / safeFraming).
//   • Baseline cells = PLACEHOLDER illustrative answers (a generic assistant's
//     typical move), clearly marked `placeholder: true`. Real transcripts land
//     after the eval harness runs (feat-011/012). See README "Assets to add".
//   • Per DECISION-MEMO §4: competitors are NOT named (no "GPT"/"Claude") — they
//     are "a leading general assistant". No fake N/X/M human-grading footnote.
//   • Every visible string still awaits Danny 审字 before this goes live.
// ─────────────────────────────────────────────────────────────────────────────

export type RedLineFlag = {
  crossed: boolean;
  note: string;
};

export type AdviceCell = {
  /** "Avery" or an anonymized baseline label. */
  advisor: string;
  /** true = illustrative placeholder, swapped for a real transcript later. */
  placeholder: boolean;
  /** Avery leads with "the read"; baselines just have their answer. */
  read?: string;
  /** Avery's concrete next move(s) for the leader. */
  move?: string[];
  /** safeFraming, quoted verbatim — the stated guardrail. */
  guardrail?: string;
  /** Raw verbatim answer (baseline cells). */
  answer?: string;
  // ── Positioning axis (eval-driven): the real diff isn't "who's kinder", it's
  // whether the advice shows its work. These optional fields carry that spine.
  /** Baseline: what the (good) general-assistant advice LEAVES OUT. Not "crossed a line". */
  missing?: string[];
  /** Avery: the evidence trail each claim is cited to. */
  evidenceCited?: string[];
  /** Avery: explicit confidence + what would change it (calibration). */
  confidence?: { level: string; rationale: string };
  /** Avery: when it stops being the manager's call alone (escalation discipline). */
  escalation?: string;
  /** Avery: what to watch to know the move worked. */
  track?: string;
  redLine: RedLineFlag;
};

export type EvalRow = {
  id: string;
  /** Short brief — the manager's read of what's going on. */
  brief: string;
  /** The frozen evidence bundle Avery was given (answers "where did the read come from?"). */
  evidence: string[];
  authoredByUs: boolean;
  kind: "situational" | "adversarial" | "null";
  cells: AdviceCell[];
};

export const EVAL_ROWS: EvalRow[] = [
  // ── Row 1 — the kind read is RIGHT (situational) ──────────────────────────
  {
    id: "lin-qing-moving-brief",
    brief:
      "One of my designers is behind on the core flow our Friday demo depends on. Status was green on Monday; now the pages keep slipping. What do I do?",
    evidence: [
      "6 days of reopened / reworked frames",
      '"What counts as done?" asked 3 days running — never answered',
      "12 unresolved feedback comments, no acceptance criteria",
      "~9 client change requests absorbed in 3 days against a brief with no agreed scope",
    ],
    authoredByUs: true,
    kind: "situational",
    // ⚠ 待 Danny 审字 — POSITIONING (eval-driven). Two-cell contrast now. The
    // general-assistant cell is a REAL, de-identified paraphrase of captured
    // advice: it is GOOD — warm, sensible, process-focused. The contrast is NOT
    // "they crossed a line"; it's what the good advice LEAVES OUT (`missing`):
    // no escalation, no stated confidence, no evidence trail. Avery does all three.
    cells: [
      {
        // ── LEFT: a general assistant — good advice, but it stops there ──────
        advisor: "A general assistant",
        placeholder: true,
        answer:
          "This reads like creative shutdown, not slacking — a designer worn down by a brief that kept moving, not someone who stopped trying. Don’t open with performance. First, freeze the scope for this week and put a buffer between the team and the stream of client changes. Then have a supportive 1:1: acknowledge the churn, get clear on what “done” means for Friday, and rebuild momentum with a short, achievable goal. Keep the tone collaborative, not corrective.",
        // What the good advice leaves out — the real, evidence-backed gap.
        missing: [
          "No escalation: never says when this stops being your call alone — e.g. if the 1:1 surfaces burnout or unfair client treatment, loop in HR.",
          "No stated confidence: reads as certain, but never tells you how sure it is or what would change the picture.",
          "No evidence trail: it asserts a sensible read, but doesn’t point to the signals it’s built on — so you can’t check it.",
        ],
        redLine: { crossed: false, note: "Good, humane advice. It just stops at “here’s what I’d do.”" },
      },
      {
        // ── RIGHT: Avery — same read, but it shows its work ─────────────────
        advisor: "Avery",
        placeholder: false,
        read:
          "Same read — creative shutdown after a moving brief, not underperformance. The finish line kept moving: roughly nine client change requests absorbed in three days against a brief with no agreed “done,” so a week of real effort never showed as visible progress.",
        move: [
          "Freeze this week’s demo scope first; keep only the core path for Friday and buffer the team from new client changes.",
          "Split ownership so the work leaves one plate: core flow stays, triage / data / visuals go elsewhere.",
          "Agree a short, completable checklist so “done” is finally clear — and lead the 1:1 with what was carried, not what’s missing.",
        ],
        // The three things the general assistant left out — Avery supplies each.
        evidenceCited: [
          "6 days of reopened / reworked frames",
          "“What counts as done?” asked 3 days running, never answered",
          "~9 client change requests absorbed in 3 days vs. a brief with no agreed scope",
        ],
        confidence: {
          level: "Medium",
          rationale:
            "The moving-brief pattern is well-evidenced; what’s unconfirmed is how the person feels. A candid 1:1 would raise or lower this.",
        },
        escalation:
          "If the 1:1 surfaces burnout signals or unfair client treatment, bring in your HRBP — that’s a wellbeing/fairness call, not a solo manager one.",
        track:
          "Watch: reopened-frame count, “done” criteria agreed, scope changes after freeze, and the person’s own read at the next check-in.",
        guardrail:
          "Still about the situation, not a grade on the person — the fix is freezing scope and making the work visible.",
        redLine: { crossed: false, note: "Same humane read — plus the evidence, the confidence, and the escalation line the general assistant didn’t give you." },
      },
    ],
  },

  // ── Row 2 — the kind read is WRONG (adversarial) ──────────────────────────
  // Satisfies Ray's must-have (DECISION-MEMO §3) + ADR-0016: Avery is decisive
  // in BOTH directions. Real authored case + transcripts land with feat-012.
  {
    id: "adversarial-kind-read-wrong",
    brief:
      "The harder case: a team member has genuinely missed repeated commitments the rest of the team is now absorbing — and the evidence doesn’t rescue them. What do I do?",
    evidence: [
      "A pattern of missed commitments — no moving brief, no hidden work",
      "The wider team is quietly absorbing the gap",
      "Full evidence bundle lands with the first eval run",
    ],
    authoredByUs: false,
    kind: "adversarial",
    // ⚠ 待 Danny 审字 — 2-cell contrast, same order as Row 1 (general assistant
    // LEFT, Avery RIGHT). The real general-assistant answer on this harder case
    // lands with the first eval run — kept as an honest placeholder, no fabrication.
    cells: [
      {
        advisor: "A general assistant",
        placeholder: true,
        answer:
          "A general assistant’s real answer on this harder case lands here with the first eval run — captured, de-identified, and paraphrased, same as the case above.",
        redLine: { crossed: false, note: "Real excerpt lands with the first eval run." },
      },
      {
        advisor: "Avery",
        placeholder: true,
        read:
          "The evidence here doesn’t point to a moving brief or hidden work — it points to missed commitments the team is now absorbing.",
        move: [
          "Name the gap plainly and directly — a specific, honest conversation about what was committed and what landed.",
          "Set a concrete, time-boxed improvement expectation — and check whether real support would change the picture.",
          "Be ready to back the hard call when it’s warranted, including a role-fit or exit conversation — handled with dignity, never with a score.",
        ],
        escalation:
          "Before an exit conversation, confirm the performance record and process with your HRBP — that’s where it stops being a solo call.",
        guardrail:
          "Still no number, no label, no “low performer” on the person — the dignity is in HOW it’s said, not in pretending the gap isn’t there.",
        redLine: { crossed: false, note: "Decisive and still on the line — it doesn’t flinch from the hard conversation, and it still refuses to put a score on the human." },
      },
    ],
  },
];

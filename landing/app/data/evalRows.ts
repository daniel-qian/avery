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
    cells: [
      {
        advisor: "Avery",
        placeholder: false,
        read:
          "The work didn't get harder — the finish line kept moving. She absorbed roughly nine client change requests in three days against a brief with no agreed “done,” so a week of real effort never showed up as visible progress.",
        move: [
          "Don’t open with performance — freeze this week’s demo scope first. Keep only the core path for Friday; no new feedback gets added in.",
          "Split who owns what so the work leaves her plate: she takes the core flow only; triage, data fields, and key visuals each go to someone else.",
          "Give her a short, completable checklist so “done” is finally clear and her contribution becomes visible.",
          "In the 1:1, lead with what she carried, not what’s missing — frame it as protecting the demo, not a review.",
        ],
        guardrail:
          "This is about understanding what wore her down this week, not grading the person. The fix is freezing the demo scope and making her work visible — not a performance call.",
        redLine: { crossed: false, note: "Stayed on the line — advised the leader on the situation; put no score, label, or diagnosis on the person." },
      },
      {
        advisor: "A leading general assistant",
        placeholder: true,
        answer:
          "She appears to be underperforming this week and is at risk of becoming a bottleneck for the demo. I’d put her completion likelihood at roughly 40%. Recommended: (1) have a direct performance conversation about why deadlines are slipping, (2) set a clear expectation that the pages ship by Thursday, (3) if she can’t deliver, reassign the core flow to a stronger designer. Consider documenting the pattern in case it continues.",
        redLine: {
          crossed: true,
          note: "Scored the person (“completion likelihood ~40%”), labeled her (“underperforming”), opened with a performance conversation — and missed the moving brief the evidence shows.",
        },
      },
      {
        advisor: "Another leading general assistant",
        placeholder: true,
        answer:
          "This looks like a designer struggling to keep up with the pace of the project. To get the demo back on track: (1) check in on her workload and assess whether she’s the right fit for the critical path, (2) clarify deadlines, (3) add a second designer to help close the gap. It may be worth flagging this to HR if the pattern persists, so there’s a record.",
        redLine: {
          crossed: true,
          note: "Put a read on the person (“right fit”), defaulted to an HR paper-trail, and missed the actual cause (unstable scope).",
        },
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
    cells: [
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
        guardrail:
          "Still no number, no label, no “low performer” on the person — the dignity is in HOW it’s said, not in pretending the gap isn’t there.",
        redLine: { crossed: false, note: "Decisive and still on the line — it doesn’t flinch from the hard conversation, and it still refuses to put a score on the human." },
      },
      {
        advisor: "A leading general assistant",
        placeholder: true,
        answer:
          "A general AI’s answer on this case lands with the first eval run.",
        redLine: { crossed: false, note: "Lands with the first eval run." },
      },
      {
        advisor: "Another leading general assistant",
        placeholder: true,
        answer:
          "A general AI’s answer on this case lands with the first eval run.",
        redLine: { crossed: false, note: "Lands with the first eval run." },
      },
    ],
  },
];

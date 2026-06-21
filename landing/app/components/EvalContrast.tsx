import { EVAL_ROWS, type EvalRow, type AdviceCell } from "../data/evalRows";

function Flag({ cell }: { cell: AdviceCell }) {
  if (cell.redLine.crossed) {
    return (
      <p className="flag flag--crossed">
        <span className="flag__icon" aria-hidden="true">
          ⚑
        </span>
        <span>
          <strong>Crossed the line.</strong> {cell.redLine.note}
        </span>
      </p>
    );
  }
  return (
    <p className="flag flag--ok">
      <span className="flag__icon" aria-hidden="true">
        ✓
      </span>
      <span>{cell.redLine.note}</span>
    </p>
  );
}

function Cell({ cell }: { cell: AdviceCell }) {
  const isAvery = cell.advisor === "Avery";
  const rejected = !isAvery && cell.redLine.crossed;
  const cls = [
    "advice-cell",
    isAvery ? "advice-cell--avery" : "advice-cell--baseline",
    rejected ? "advice-cell--rejected" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls}>
      <div className="advice-cell__advisor">
        {cell.advisor}
        {rejected && <span className="rejected-tag">rejected read</span>}
        {cell.placeholder && !rejected && (
          <span className="placeholder-tag">illustrative</span>
        )}
      </div>

      {/* Avery leads with "the read" → "the move" → guardrail */}
      {cell.read && (
        <>
          <div className="advice-label">The read</div>
          <p className="advice-cell__read">{cell.read}</p>
        </>
      )}

      {cell.move && cell.move.length > 0 && (
        <>
          <div className="advice-label">The move — yours to decide</div>
          <ul>
            {cell.move.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </>
      )}

      {cell.guardrail && (
        <p className="guardrail">&ldquo;{cell.guardrail}&rdquo;</p>
      )}

      {/* Baseline cells: the raw answer */}
      {cell.answer && <p className="advice-cell__answer">{cell.answer}</p>}

      <Flag cell={cell} />
    </div>
  );
}

function Row({ row }: { row: EvalRow }) {
  return (
    <div className="eval-row">
      <div className="eval-row__brief">
        <p className="q">&ldquo;{row.brief}&rdquo;</p>
        <div className="chips">
          <span className="chip">
            {row.authoredByUs ? "authored by us" : "not authored by us"}
          </span>
          {row.kind === "adversarial" && (
            <span className="chip chip--adv">
              the kind read is the wrong read
            </span>
          )}
        </div>
      </div>

      {/* The evidence Avery was given — answers "where did the read come from?" (DECISION-MEMO §4.2) */}
      <div className="evidence">
        <div className="evidence__label">The evidence each advisor was given</div>
        <ul>
          {row.evidence.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>

      <div className="advice-grid">
        {row.cells.map((c, i) => (
          <Cell key={i} cell={c} />
        ))}
      </div>
    </div>
  );
}

export function EvalContrast() {
  return (
    <section className="section" id="eval">
      <div className="wrap">
        <div className="section__head">
          <div className="eyebrow">Avery vs. a general AI — the actual words</div>
          <h2>Same situation, same evidence. Read them side by side.</h2>
          <p>
            Not a scoreboard. Given the exact situation a manager faces, here is
            what Avery said — next to what a general AI assistant gives back from
            the same brief.
          </p>
        </div>

        <div className="eval__note">
          <strong>A preview, and we&rsquo;ll be straight about it.</strong> The
          comparison answers below are illustrative of what a general assistant
          tends to do. The real version is pre-registered, not cherry-picked:
          every advisor gets the <em>byte-identical</em> prompt and evidence, the
          baseline prompts are published so no one&rsquo;s hobbled, and the
          25&ndash;30 scenarios are frozen and git-hashed before a single run.
          Blind-graded transcripts and the honest human-preference numbers land
          here once the eval runs &mdash; not before.
        </div>

        {EVAL_ROWS.map((row) => (
          <Row key={row.id} row={row} />
        ))}

        <p className="eval__note" style={{ marginBottom: 0 }}>
          We evaluate <strong>the advice</strong>, never <strong>the person</strong>.
          No scores, grades, or labels on any human appear anywhere on this page —
          by design.
        </p>
      </div>
    </section>
  );
}

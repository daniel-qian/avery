import { EVAL_ROWS, type EvalRow, type AdviceCell } from "../data/evalRows";
import type { Dict } from "../i18n";

// Framing copy comes from the i18n dictionary. The advice-transcript ROWS
// (evalRows.ts) intentionally stay as-is — placeholder fixtures tied to the
// (empty) eval, replaced by real eval-harness output later.

function Flag({ cell }: { cell: AdviceCell }) {
  if (cell.redLine.crossed) {
    return (
      <p className="flag flag--crossed">
        <span className="flag__icon" aria-hidden="true">⚑</span>
        <span><strong>Crossed the line.</strong> {cell.redLine.note}</span>
      </p>
    );
  }
  return (
    <p className="flag flag--ok">
      <span className="flag__icon" aria-hidden="true">✓</span>
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
  ].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <div className="advice-cell__advisor">
        {cell.advisor}
        {rejected && <span className="rejected-tag">rejected read</span>}
        {cell.placeholder && !rejected && <span className="placeholder-tag">illustrative</span>}
      </div>

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
            {cell.move.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </>
      )}

      {cell.guardrail && <p className="guardrail">&ldquo;{cell.guardrail}&rdquo;</p>}
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
          <span className="chip">{row.authoredByUs ? "authored by us" : "not authored by us"}</span>
          {row.kind === "adversarial" && (
            <span className="chip chip--adv">the kind read is the wrong read</span>
          )}
        </div>
      </div>

      <div className="evidence">
        <div className="evidence__label">The evidence each advisor was given</div>
        <ul>
          {row.evidence.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <div className="advice-grid">
        {row.cells.map((c, i) => <Cell key={i} cell={c} />)}
      </div>
    </div>
  );
}

export function EvalContrast({ t }: { t: Dict["evalSection"] }) {
  return (
    <section className="section" id="eval">
      <div className="wrap">
        <div className="section__head">
          <div className="eyebrow">{t.eyebrow}</div>
          <h2>{t.h2}</h2>
          <p>{t.p}</p>
        </div>

        <div className="eval__note">
          <strong>{t.noteStrong}</strong>{t.noteRest}
        </div>

        <p className="eval__note" style={{ fontStyle: "italic" }}>{t.rowsNote}</p>

        {EVAL_ROWS.map((row) => <Row key={row.id} row={row} />)}

        <p className="eval__note" style={{ marginBottom: 0 }}>{t.footer}</p>
      </div>
    </section>
  );
}

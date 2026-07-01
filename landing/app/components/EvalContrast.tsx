import { EVAL_ROWS, type EvalRow, type AdviceCell } from "../data/evalRows";
import type { Dict } from "../i18n";

// Framing copy comes from the i18n dictionary. The advice-transcript ROWS
// (evalRows.ts) are placeholder fixtures tied to the (empty) eval, replaced by
// real eval-harness output later.
//
// POSITIONING (eval-driven): the contrast is NOT "villain labels the person".
// The general-assistant cell holds GOOD advice; what it LEAVES OUT (`missing`)
// — escalation, stated confidence, evidence trail — is the real diff. Avery
// supplies all three (evidenceCited / confidence / escalation / track).

function Flag({ cell }: { cell: AdviceCell }) {
  return (
    <p className="flag flag--ok">
      <span className="flag__icon" aria-hidden="true">✓</span>
      <span>{cell.redLine.note}</span>
    </p>
  );
}

function Cell({ cell }: { cell: AdviceCell }) {
  const isAvery = cell.advisor === "Avery";
  const cls = [
    "advice-cell",
    isAvery ? "advice-cell--avery" : "advice-cell--baseline",
  ].join(" ");
  return (
    <div className={cls}>
      <div className="advice-cell__advisor">
        {cell.advisor}
        {/* Run has happened: real cells are labelled "real · de-identified";
            cells still awaiting a capture keep an honest "capture pending" tag. */}
        {cell.placeholder ? (
          <span className="placeholder-tag">capture pending</span>
        ) : (
          <span className="real-tag">real answer · de-identified</span>
        )}
      </div>

      {cell.read && (
        <>
          <div className="advice-label">The read</div>
          <p className="advice-cell__read">{cell.read}</p>
        </>
      )}

      {cell.answer && <p className="advice-cell__answer">{cell.answer}</p>}

      {cell.move && cell.move.length > 0 && (
        <>
          <div className="advice-label">The move — yours to decide</div>
          <ul>
            {cell.move.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </>
      )}

      {/* Avery-only spine: the three things a general assistant left out. */}
      {cell.evidenceCited && cell.evidenceCited.length > 0 && (
        <>
          <div className="advice-label">Why I&rsquo;m saying this</div>
          <ul className="advice-cell__evidence">
            {cell.evidenceCited.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </>
      )}

      {cell.confidence && (
        <div className="advice-extra">
          <span className="advice-extra__k">How sure it is</span>
          <p><strong>{cell.confidence.level}</strong> — {cell.confidence.rationale}</p>
        </div>
      )}

      {cell.escalation && (
        <div className="advice-extra advice-extra--escalate">
          <span className="advice-extra__k">When to pull in HR</span>
          <p>{cell.escalation}</p>
        </div>
      )}

      {cell.track && (
        <div className="advice-extra">
          <span className="advice-extra__k">What to watch to know it worked</span>
          <p>{cell.track}</p>
        </div>
      )}

      {/* Baseline-only: what the good advice leaves out (not "crossed a line"). */}
      {cell.missing && cell.missing.length > 0 && (
        <div className="advice-missing">
          <div className="advice-missing__label">Good advice — but it stops here</div>
          <ul>
            {cell.missing.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {cell.guardrail && <p className="guardrail">&ldquo;{cell.guardrail}&rdquo;</p>}

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

      <div className="advice-grid advice-grid--pair">
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

        {/* Reserved slot — where a REAL blind-graded transcript pair + scorecard
            drop in once the eval runs. Deliberately empty; NO fabricated numbers. */}
        <div className="eval-slot" aria-label="reserved for real eval result">
          <div className="eval-slot__eyebrow">{t.slotEyebrow}</div>
          <h3 className="eval-slot__title">{t.slotTitle}</h3>
          <p className="eval-slot__body">{t.slotBody}</p>
          <div className="eval-slot__axes">
            {t.slotAxes.map((a) => (
              <span className="eval-slot__axis" key={a}>{a}</span>
            ))}
          </div>
          <p className="eval-slot__pending">{t.slotPending}</p>
        </div>

        <p className="eval__note" style={{ fontStyle: "italic" }}>{t.rowsNote}</p>

        {EVAL_ROWS.map((row) => <Row key={row.id} row={row} />)}

        <p className="eval__note" style={{ marginBottom: 0 }}>{t.footer}</p>
      </div>
    </section>
  );
}

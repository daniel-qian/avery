// "What Avery gives back" — the canonical 8-part auditable brief
// (advice_output_schema from the partner pack). SAME 8 parts the demo card +
// eval use; headings kept consistent with the team board's SHARED CONTRACT.
// Strings from the i18n dictionary. ⚠ 待 Danny 审字.
// Review fix 2: raw schema keys (f.k) are DATA ONLY — never rendered on screen.

import type { Dict } from "../i18n";

export function OutputShape({ t }: { t: Dict["output"] }) {
  return (
    <section className="section" id="output">
      <div className="wrap">
        <div className="masthead">
          <span>{t.mastheadL}</span>
          <span>{t.mastheadR}</span>
        </div>
        <div className="split-head">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2>{t.h2}</h2>
          </div>
          <p className="lede">{t.lede}</p>
        </div>

        <div className="output-grid">
          {t.fields.map((f) => (
            // f.k = canonical schema key — used only as a stable React key,
            // deliberately NOT rendered (no raw schema words on screen).
            <div className="output-field" key={f.k}>
              <div className="output-field__top">
                <span className="output-field__n">{f.n}</span>
                <span className="output-field__lbl">{f.lbl}</span>
              </div>
              <p>{f.p}</p>
            </div>
          ))}
        </div>

        {/* Optional 9th field — the conversation_script, the "senior at your
            ear" voice made literal. Rendered as a distinct trailing band. */}
        <div className="output-script">
          <span className="output-script__eyebrow">{t.scriptLabel}</span>
          <strong>{t.scriptField}</strong>
          <p>{t.scriptP}</p>
        </div>
      </div>
    </section>
  );
}

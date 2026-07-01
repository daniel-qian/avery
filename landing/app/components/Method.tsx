// Deck slide 08 (How Avery thinks). Strings from i18n dictionary. "Case match"
// uses the surface label "Playbooks". ⚠ 待 Danny 审字.

import type { Dict } from "../i18n";

export function Method({ t }: { t: Dict["method"] }) {
  return (
    <section className="section section--ink" id="how">
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
        <div className="grid-cards grid-cards--4">
          {t.steps.map((s) => (
            <div className="ed-card ed-card--paper" key={s.n}>
              <div className="n">{s.n}</div>
              <h4>{s.h4}</h4>
              <p>{s.p}</p>
              <div className="meta"><span>{s.metaA}</span><span>{s.metaB}</span></div>
            </div>
          ))}
        </div>

        {/* Guardrails — the 5 escalation lines from the partner pack.
            ⚠ 待 Danny 审字. Rendered as a distinct band under the 4 steps. */}
        <div className="guardrails">
          <div className="guardrails__head">
            <div className="eyebrow">{t.guardrailsEyebrow}</div>
            <p className="lede">{t.guardrailsLede}</p>
          </div>
          <div className="guardrail-grid">
            {t.guardrails.map((g) => (
              <div className="guardrail-card" key={g.k}>
                <span className="guardrail-card__k">{g.k}</span>
                <h4>{g.h4}</h4>
                <p>{g.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

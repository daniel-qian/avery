// Deck slide 05 (The cost of the wrong cut). Strings from i18n dictionary.
// Public layoff analogy de-named. ⚠ 待 Danny 审字.

import type { Dict } from "../i18n";

export function WrongCut({ t }: { t: Dict["wrongCut"] }) {
  return (
    <section className="section" id="wrong-cut">
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
          {t.steps.map((s, i) => (
            <div className={`ed-card${i % 2 === 1 ? " ed-card--alt" : ""}`} key={s.n}>
              <div className="n">{s.n}</div>
              <h4>{s.h4}</h4>
              <p>{s.p}</p>
              <div className="meta"><span>{s.metaA}</span><span>{s.metaB}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

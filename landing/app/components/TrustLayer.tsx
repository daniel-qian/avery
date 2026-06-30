// Deck slide 12 (Trust layer). Strings from i18n dictionary. ⚠ 待 Danny 审字.

import type { Dict } from "../i18n";

export function TrustLayer({ t }: { t: Dict["trustLayer"] }) {
  return (
    <section className="section" id="trust">
      <div className="wrap">
        <div className="masthead">
          <span>{t.mastheadL}</span>
          <span>{t.mastheadR}</span>
        </div>

        <div className="statement-block">
          <h2 className="statement">{t.stmtA}</h2>
          <div className="ornament" aria-hidden="true">
            <span className="lines" />
            <span className="word">{t.stmtWord}</span>
            <span className="lines" />
          </div>
          <h2 className="statement">{t.stmtB}</h2>
        </div>

        <div className="grid-cards grid-cards--3">
          {t.cards.map((c) => (
            <div className={`ed-card${c.n === "02" ? " ed-card--alt" : ""}`} key={c.n}>
              <div className="n">{c.n}</div>
              <h4>{c.h4}</h4>
              <p>{c.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

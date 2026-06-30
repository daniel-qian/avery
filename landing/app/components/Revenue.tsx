// Deck slide 13 (Commercial model). Investor content — trim candidate, kept per
// "stuff it all in". Strings from i18n dictionary. ⚠ 待 Danny 审字.

import type { Dict } from "../i18n";

export function Revenue({ t }: { t: Dict["revenue"] }) {
  return (
    <section className="section" id="revenue">
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

        <div className="kpi-grid">
          {t.kpis.map((k, i) => (
            <div className={`kpi${i % 2 === 1 ? " kpi--alt" : ""}`} key={k.lbl}>
              <div className="lbl">{k.lbl}</div>
              <div className="val">{k.val}<span className="u">%</span></div>
              <div className="delta">{k.delta}</div>
              <div className="desc">{k.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

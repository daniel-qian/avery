// Deck slide 03 (Audience). Strings from i18n dictionary. ⚠ 待 Danny 审字.

import type { Dict } from "../i18n";

export function Audience({ t }: { t: Dict["audience"] }) {
  return (
    <section className="section" id="who">
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
        <div className="marks">
          {t.marks.map((m, i) => <span className="mark" key={i}>{m}</span>)}
        </div>
      </div>
    </section>
  );
}

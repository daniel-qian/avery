// "What Avery is / isn't" — safeFraming + privacy promise + ADR-0016
// decisiveness. Strings from i18n dictionary. ⚠ 待 Danny 审字.

import type { Dict } from "../i18n";

export function WhatItIs({ t }: { t: Dict["whatItIs"] }) {
  return (
    <section className="section" id="what">
      <div className="wrap">
        <div className="section__head">
          <div className="eyebrow">{t.eyebrow}</div>
          <h2>{t.h2}</h2>
        </div>

        <div className="isnt-grid">
          <div className="isnt-card isnt-card--is">
            <h3>{t.isHead}</h3>
            <ul>
              {t.is.map((li, i) => <li key={i}>{li}</li>)}
            </ul>
          </div>
          <div className="isnt-card isnt-card--isnt">
            <h3>{t.isntHead}</h3>
            <ul>
              {t.isnt.map((li, i) => <li key={i}>{li}</li>)}
            </ul>
          </div>
        </div>

        <p className="privacy-line">
          <strong>{t.privacyStrong}</strong> {t.privacyRest}
        </p>
      </div>
    </section>
  );
}

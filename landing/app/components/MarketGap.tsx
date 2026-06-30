// Deck slide 06 (Market gap). Competitor names collapsed to categories.
// Scores are the deck's illustrative numbers (language-agnostic, kept here);
// labels come from the i18n dictionary. ⚠ 待 Danny 审字.

import type { Dict } from "../i18n";

const SCORES: [number, number][] = [[82, 41], [76, 48], [84, 39]];
const AVERY_SCORES: [number, number] = [92, 88];

function Metric({ score, label }: { score: number; label: string }) {
  return (
    <div className="gap-metric">
      <div className="row"><strong>{score}</strong><span>{label}</span></div>
      <div className="gap-bar"><span style={{ width: `${score}%` }} /></div>
    </div>
  );
}

export function MarketGap({ t }: { t: Dict["marketGap"] }) {
  return (
    <section className="section" id="gap">
      <div className="wrap">
        <div className="split-head">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2>{t.h2}</h2>
          </div>
          <p className="lede">{t.lede}</p>
        </div>

        <div className="eyebrow" style={{ marginBottom: 14 }}>{t.gapLabel}</div>
        <div className="gap-grid">
          {t.panels.map((p, i) => (
            <div className="gap-panel" key={p.name}>
              <span className="eyebrow">{p.name}</span>
              <h4>{p.line}</h4>
              <Metric score={SCORES[i][0]} label={p.m1label} />
              <Metric score={SCORES[i][1]} label={p.m2label} />
            </div>
          ))}
          <div className="gap-panel gap-panel--avery">
            <span className="eyebrow">{t.averyPanel.name}</span>
            <h4>{t.averyPanel.line}</h4>
            <Metric score={AVERY_SCORES[0]} label={t.averyPanel.m1label} />
            <Metric score={AVERY_SCORES[1]} label={t.averyPanel.m2label} />
          </div>
        </div>
        <div className="decision-strip">
          {t.strip.map((s) => (
            <div key={s.label}><strong>{s.label}</strong><span>{s.text}</span></div>
          ))}
        </div>

        <div style={{ marginTop: "clamp(28px,4vw,44px)" }}>
          {t.rows.map((r) => (
            <div className="vs-row" key={r.name}>
              <div className="vs-row__name">
                {r.name}
                <span>{r.detail}</span>
              </div>
              <div className="vs-box">
                <strong>{t.themLabel}</strong>
                <span>{r.them}</span>
              </div>
              <div className="vs-box vs-box--ours">
                <strong>{t.oursLabel}</strong>
                <span>{r.ours}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

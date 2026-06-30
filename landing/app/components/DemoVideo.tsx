// Demo-video slot — placeholder until feat-013. Strings from i18n dictionary.

import type { Dict } from "../i18n";

export function DemoVideo({ t }: { t: Dict["demoVideo"] }) {
  return (
    <section className="section" id="watch">
      <div className="wrap">
        <div className="section__head">
          <div className="eyebrow">{t.eyebrow}</div>
          <h2>{t.h2}</h2>
          <p>{t.p}</p>
        </div>

        {/* ▼ PLACEHOLDER — replace with the real <video>/embed (feat-013) */}
        <div className="video-slot" role="img" aria-label="Demo video coming soon">
          <span className="video-slot__badge">{t.badge}</span>
          <div className="video-slot__play" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="video-slot__cap">{t.cap}</p>
        </div>
        {/* ▲ PLACEHOLDER */}
      </div>
    </section>
  );
}

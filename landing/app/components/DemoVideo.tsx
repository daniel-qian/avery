// Demo-video slot — placeholder until feat-013 delivers the 60–90s first cut.
// Drop the final embed (mp4 / Mux / YouTube) in where marked. (See README.)

export function DemoVideo() {
  return (
    <section className="section" id="watch">
      <div className="wrap">
        <div className="section__head">
          <div className="eyebrow">A 60-second look</div>
          <h2>One real situation, start to finish.</h2>
          <p>
            Watch Avery catch what a busy manager would miss — and hand back a
            move you can make tomorrow.
          </p>
        </div>

        {/* ▼ PLACEHOLDER — replace this whole block with the real <video>/embed (feat-013) */}
        <div className="video-slot" role="img" aria-label="Demo video coming soon">
          <span className="video-slot__badge">Demo video — coming soon</span>
          <div className="video-slot__play" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="video-slot__cap">
            The 60-second product video drops in here once it&rsquo;s cut.
          </p>
        </div>
        {/* ▲ PLACEHOLDER */}
      </div>
    </section>
  );
}

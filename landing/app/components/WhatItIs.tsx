// "What Avery is / isn't" — leans on safeFraming + a privacy promise, plus the
// ADR-0016 decisiveness line (helps you HAVE the hard call when warranted, not
// avoid it). NOTE: the literal on-device claim ("nothing goes to a server",
// roundtable-greenlit) was dropped after all three persona checkers read it as
// defensive / raising "where does the model run?"; the warm, verifiable half is
// kept. Re-leading with on-device is a founder decision — see landing/README.md.

export function WhatItIs() {
  return (
    <section className="section" id="what">
      <div className="wrap">
        <div className="section__head">
          <div className="eyebrow">What Avery is — and isn&rsquo;t</div>
          <h2>A senior voice on your side. Never a verdict on your people.</h2>
        </div>

        <div className="isnt-grid">
          <div className="isnt-card isnt-card--is">
            <h3>What Avery is</h3>
            <ul>
              <li>A senior advisor in your ear before a hard conversation.</li>
              <li>
                It reads the situation and hands you a concrete move you could
                make tomorrow.
              </li>
              <li>
                Decisive in both directions: it helps you handle the hard call
                when it&rsquo;s warranted &mdash; not just avoid it.
              </li>
              <li>It always shows you what it&rsquo;s seeing, in plain words.</li>
            </ul>
          </div>

          <div className="isnt-card isnt-card--isnt">
            <h3>What Avery isn&rsquo;t</h3>
            <ul>
              <li>A dashboard that watches or grades your team.</li>
              <li>A flight-risk score, an engagement grade, a label on a person.</li>
              <li>An HR paper-trail or a way to dodge the conversation.</li>
              <li>One more tool that turns people into numbers.</li>
            </ul>
          </div>
        </div>

        <p className="privacy-line">
          <strong>Your situations stay yours.</strong> Nothing about your people
          is scored, filed, or kept against anyone.
        </p>
      </div>
    </section>
  );
}

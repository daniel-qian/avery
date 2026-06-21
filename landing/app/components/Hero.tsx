// ⚠ All visible copy here is drawn from the reviewed copy-kit / DECISION-MEMO §2
// (recommended master slug) but still awaits Danny 审字 before launch.

export function Hero() {
  return (
    <header className="hero">
      <div className="wrap">
        <div className="hero__mark">Avery</div>

        {/* DECISION-MEMO §2 master slug */}
        <h1 className="hero__title">
          The <em>senior at your ear</em> for the conversation you keep putting
          off.
        </h1>

        {/* §2: #2 line kept as the sub-header, not the master */}
        <p className="hero__sub">Notice sooner. Handle it better.</p>

        <div className="hero__cta">
          {/* CTA per issue #2 + copy-kit */}
          <a className="btn btn--primary" href="#book">
            Book a 15-min look
          </a>
          <a className="btn btn--ghost" href="#eval">
            See the actual advice
          </a>
        </div>

        <p className="hero__reassure">
          A senior voice in your ear — not a dashboard that watches your team.
          Nothing gets scored or stored against anyone.
        </p>
      </div>
    </header>
  );
}

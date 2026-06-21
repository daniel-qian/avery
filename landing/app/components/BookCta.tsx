"use client";

import { useState } from "react";

// Email capture + final CTA. The form is a scaffold: on submit it just confirms
// locally. Wire it to a real list / scheduler before launch (see README "Assets
// to add" — e.g. a Formspree/ConvertKit endpoint or a Cal.com link).

export function BookCta() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO(real-asset): POST to the real capture endpoint / scheduler.
    setDone(true);
  }

  return (
    <section className="wrap" id="book">
      <div className="cta">
        <h2>Bring one situation you&rsquo;ve been sitting on.</h2>
        <p>
          15 minutes, one real case &mdash; yours or one of ours. No pitch deck.
          If it&rsquo;s not for you, just say so.
        </p>

        {done ? (
          <p className="capture__ok">
            Thanks &mdash; we&rsquo;ll be in touch to find 15 minutes. 🙏
          </p>
        ) : (
          <form className="capture" onSubmit={onSubmit}>
            <input
              type="email"
              required
              placeholder="you@company.com"
              aria-label="Your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn--primary">
              Book a 15-min look
            </button>
          </form>
        )}

        <p className="cta__micro">
          The tools are free. We&rsquo;ll never put your people on a dashboard.
        </p>
      </div>
    </section>
  );
}

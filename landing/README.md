# Avery — landing page

A deployable single-page landing **scaffold** for Avery. Conversion destination
every channel points to: slug + demo video + advice-contrast eval + CTA.

> **Standalone by design (ADR-0001).** This lives in its own directory with its
> own `package.json`/build and does **not** touch the demo prototype's Vite app.
> It is structured to be lifted into its own Git repo at any time. To deploy on
> Vercel from this monorepo, set the project's **Root Directory** to `landing/`.

## Run locally

```bash
cd landing
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (acceptance: builds clean)
```

## Sections (all present; placeholders where assets pending)

| Section | Source | State |
|---|---|---|
| Hero — slug + CTA | DECISION-MEMO §2 master slug, CTA "Book a 15-min look" | copy in place |
| Demo video | feat-013 | **placeholder slot** |
| Eval / advice-contrast | eval-sheet-spec §3–§4 (NOT a scoreboard) | Lin Qing mock + adversarial row; baseline cells **illustrative** |
| What Avery is / isn't | `safeFraming` + on-device privacy line (Dana 🟢) + ADR-0016 decisiveness | copy in place |
| Email capture + CTA | copy-kit | form is a **scaffold** (confirms locally; not wired) |

## ⚠ Real assets to drop in later

1. **Final demo video (feat-013).** Replace the placeholder block in
   `app/components/DemoVideo.tsx` (marked `▼ PLACEHOLDER`) with the real
   `<video>` / Mux / YouTube embed.
2. **Real eval transcripts + numbers (feat-011 / feat-012).** In
   `app/data/evalRows.ts`, every cell with `placeholder: true` is illustrative.
   Swap in the real blind-graded transcripts once the eval harness runs, and add
   the honest human-preference numbers (only when real — per DECISION-MEMO §4.1,
   no fake `N/X/M` footnote).
3. **The adversarial row's real authored case (feat-012).** Row
   `adversarial-kind-read-wrong` is shaped but uses placeholder copy; fill from
   the frozen "kind read is wrong" scenario.
4. **Email capture endpoint.** Wire the form in `app/components/BookCta.tsx`
   (`TODO(real-asset)`) to a real list/scheduler (e.g. Formspree / ConvertKit /
   Cal.com link).
5. **Domain.** `avery.???` — pending the domain decision (P7-06 open Q).
6. **Danny 审字.** Every visible external string is drawn from the reviewed
   copy-kit / eval-spec but still needs final founder sign-off before launch.
   (Markers are deliberately kept OUT of the rendered page — DECISION-MEMO §6.5.)

## ⚠ Founder decisions surfaced by the persona checkers (Ray / Dana / Will)

The scaffold was reviewed by the three buyer/voice personas. Acted-on feedback
is already in the page. These are left for Danny because they conflict with a
locked decision or need a fact only he has:

- **On-device / privacy wording.** The 2026-06-20 roundtable green-lit "nothing
  leaves, nothing goes to a server — lead louder with this." But all three
  checkers independently flagged the literal "server" phrasing as defensive /
  raising "where does the model actually run?" So the page now leads with the
  warm, verifiable half ("nothing gets scored or stored against anyone") and the
  techy absolute was dropped. **Decision for Danny:** if on-device is
  architecturally true and you want to confirm it, we can lead louder with it
  again (per the roundtable); if not, leave it dropped.
- **Hero slug — kept as-is (not changed).** Will suggested "A senior voice in
  your ear…" over "the senior at your ear" (noun ambiguity). Held: DECISION-MEMO
  §2 mandates the exact master slug and it's the line both buyers quoted back.
- **Sub-header — kept as-is.** Will rates "Bring one situation you've been
  sitting on" (final CTA) as the strongest line on the page and "Notice sooner.
  Handle it better." as the weakest headline-tier line. Held: §2 sanctions the
  #2 line as the sub-header. Worth A/B-testing post-launch.
- **Strong real baselines.** Ray: the illustrative baselines look engineered to
  lose; a blowout against a weak strawman discounts Avery's win too. The fix is
  real transcripts vs. a *strong* baseline with published prompts — that's the
  eval run (feat-011/012), already item 2 above. The eval note now states the
  pre-registration safeguards up front to blunt the "strawman" read in the
  meantime.

## Red-line compliance (built in)

- No score / grade / label / diagnosis on any person, anywhere on the page.
- Competitors are not named ("a leading general assistant" — DECISION-MEMO §4.3).
- The evidence each advisor was given is shown, so Avery's read looks grounded,
  not clairvoyant (DECISION-MEMO §4.2).
- Decisive in both directions — the adversarial row + "what Avery is" make clear
  Avery helps you *have* the hard call, not avoid it (ADR-0016).
- No "TeamMaster" / internal surface terms (Nexus / Dashboard / Reality gap /
  Manifest / Capabilities).

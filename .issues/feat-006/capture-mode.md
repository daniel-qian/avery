# feat-006 · Clean capture mode — implementation + evidence

P7-02. A presentation-layer "capture mode" so Danny can screen-record a clean 60–90s Lin Qing
demo of Avery. **Hide/clean only — no scene rebuilds, no rails-logic change.**

## How Danny enters/exits capture mode

- **URL flag (recommended for recording):** open `http://localhost:5173/?capture=1` — the page
  loads already clean (no chrome, red-line guard on). Drop the param (or `?capture=0`) for the
  normal dev view.
- **Live toggle:** press **`c`** any time to flip capture on/off. Unlike the legacy quick-peek
  `h`, capture is **sticky** — driving the rail (Arrow keys / `r`) does **not** turn it back off.
- Legacy keys unchanged: `→`/`Space` next, `←` prev, `r` restart, `h` quick-hide (one-shot, reset
  by the next seek).

## What capture mode hides / cleans

1. **Dev/debug chrome (DemoControls):** the rail progress panel
   (`Drill Lin Qing — current state · 4/26 · 3/3 · → your turn · free-click`) **and** the
   `Use case —` title cards. Keyboard navigation still works (the key handler lives in a separate
   effect, independent of render).
2. **Red-line guard (ADR-0015/0016) — no number on a person:** on an employee detail page the
   Progress stat is `48% · brief kept moving`. In capture mode the leading `48% · ` is stripped, so
   it renders as prose only (`brief kept moving` / `core path protected`); if a value strips to
   empty the Progress slot is dropped entirely. The dashboard's project/team `48%`/`72%` numbers
   stay (those are project data, not a number on a person).
3. **`⚠ 待 Danny 审字` review markers:** all such markers in the codebase are **code comments**
   (`//` and `{/* */}`), which never reach the DOM — verified `body.innerText` has zero `⚠` across
   the spine. Capture mode formally guarantees no review chrome renders. No literal `TODO`/
   placeholder *text* renders either (the `placeholder=` attributes are intentional input UI copy).

## Files changed (presentation-only, 3 files)

- `src/store/railStore.ts` — added sticky `capture` flag (init from `?capture=1`, **not** reset by
  `seek`, unlike `hidden`) + `toggleCapture`. `SCRIPT` / `seek` replay / `run()` untouched.
- `src/components/DemoControls.tsx` — `if (hidden || capture) return null`; added `c` toggle key.
- `src/components/scenes/EmployeeDetailScene.tsx` — `stripPersonNumber()` + capture-conditional
  `progressDisplay`, Progress slot rendered only when non-empty.

## Verification evidence (2026-06-21)

- **Build:** `./init.sh` green — `tsc -b` zero errors + `vite build` ✓ (~1.3s).
- **Behavior (DOM assertions via running dev server, capture on):**
  - Onboarding (idx 0): `demo=false, titleCard=false, warnInBody=false`.
  - Lin Qing detail, believed (idx 5): Progress renders `brief kept moving` (no `48%`);
    `overviewHasPercent=false`; chrome hidden.
  - Hero frame (idx 12): card header renders `WORTH A CLOSER LOOK — What the Manager Sees vs.
    What Lin Qing Is Carrying`; `stageHas48=false`; the word **"MISMATCH" does not render**
    (`body.innerText` has zero occurrences — it is only a CSS class name); chrome hidden.
  - Lin Qing detail, grown (idx 15): Progress renders `core path protected`;
    `overviewHasPercent=false`; chrome hidden.
  - **Contrast (capture OFF, idx 5):** rail panel reappears and Progress shows `48% · brief kept
    moving` (`overviewHasPercent=true`) — proves the strip is capture-conditional, not a scene edit.
  - **Stickiness:** with capture ON, `→ → ←` (seeks) keep chrome hidden — the old `hidden`-via-`h`
    bug (reset to false on every `seek`) is fixed by the separate sticky flag.
  - Spine order confirmed (sampled + deterministic SCRIPT replay):
    onboarding → dashboard → Lin Qing detail → nexus (terminal stream → manager-sees-vs-carrying →
    human-loop Send → "The read") → Lin Qing detail (grown) → briefing regenerated.
- **Screenshots:** pixel screenshots could not be captured — the continuous canvas rAF animation
  saturates the renderer and times out the preview screenshot tool (the known canvas-eval-timeout
  noted in the issue). Evidence above is exact rendered DOM text instead; Danny records the actual
  video.
- **Checkers (maker≠checker):**
  - **Claire (spine + presentation):** PASS. Drove all 31 SCRIPT steps in capture mode — zero
    `.demo-controls` / `.rail-title-card` / `⚠`; spine in correct order; confirmed 3 files are
    presentation-only against the working-tree diff.
  - **Dana (human-feel + red line):** PASS on the red line — `48%` gone from Lin Qing's scorecard;
    remaining evidence digits (`~9 change requests in 3 days`, `6 days running`) read as the helper
    *defending* her ("the brief kept moving under her"), not scoring her. Gate (word "MISMATCH"
    must not be in frame) verified clean.

## Out-of-scope notes for Danny (not changed here — copy, not capture chrome)

- Dana 🟡: the manifest label **`WHAT AVERY PUT TOGETHER`** reads as the tool announcing its output;
  a person-voiced header would land warmer. Existing product copy — a 审字 candidate.
- Dana 🟡: the **`HR SIGNAL`** label has a faint dashboard whiff (content `a good moment to check in`
  is fine).
- Terminal-stream line *"…Surfacing the gap as evidence, not judgment."* contains "the gap" but is
  a defending line (approved feat-004 stream copy) — left as-is.
- `stripPersonNumber` strips a **leading** `\d+%` only (correct for current `48% · …` fixtures); if a
  future fixture puts a number mid-string, add a guard then.
- Free-click cue (`→ your turn · free-click` for B2/B9/E3) is hidden with the rail panel by design —
  Danny drives Send/dispatch from rehearsal muscle memory during a take.

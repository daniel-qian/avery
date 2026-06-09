# Handoff — P5 pan/zoom canvas, iteration round (paused pre founder meeting)

**Repo:** `D:\TeamMaster-Prototype-2.0` · branch `main` · Vite + React 18 + framer-motion + zustand + **react-zoom-pan-pinch@3.4.3** (added this round)
**Status:** ④⑤⑥ pan/zoom canvas landed + 3 iteration passes on Dashboard layout/HUD. **Uncommitted** (working tree dirty). typecheck ✅ build ✅. Dev server stopped.
**Next action: UNDECIDED** — paused for founder feedback today; more polish expected after. This doc is for a cold resume.

---

## 0 · READ FIRST
1. **`docs/adr/0012-pannable-zoomable-canvas-rail-derived-camera.md`** — the source of truth. Read the base decision + **修订 1→2→3→4 in order** (most recent decisions win). This handoff does NOT restate the ADR; it only adds resume context.
   - 修订2: ring → soft team zones · briefing world→HUD · weather-forward nodes · wide board.
   - 修订3: **full-bleed camera** (insets near-zero); **HUD-safe-rect通则退役**, replaced by "no solid side panel" invariant → **Nexus inspector demoted to top-right corner chrome**; top HUD = full-width tag bar.
   - 修订4: both brief lines → top-center HUD clean text.
2. `CONTEXT.md` — glossary (unchanged this round; soft team zones are impl, not a glossary term; Dashboard stays "ambient weather map").
3. Memory: `…/memory/prefer-runtime-navigation-over-handtuned-layout.md` — the motivating principle (formula coords + runtime pan/zoom, don't hand-pack one screen).

## 1 · Iron rules (unchanged, still binding)
- **Don't extend `src/store/canvasStore.ts`** — camera/pan/zoom are component-local / rzpp ref, never store.
- **replay-safe** — camera = pure function of active step (Nexus `thread.steps`) / `focus` (Dashboard). `seek` rewinds and recomputes.
- **rail-deletable** — pan/zoom is core; deleting rail (`railStore`+`DemoControls`) must leave it working.
- **board px only** for world objects (no vw / viewport-% / `clamp(...100%)`); those units are HUD-only.

## 2 · Architecture as built (files)
| File | Role |
|---|---|
| `src/data/board.ts` | `BOARD` (2600×1640 wide, Dashboard) · `NEXUS_BOARD` (2700×2520 tall) · `polar()` · `bboxOf()` |
| `src/data/layout.ts` | **Dashboard soft team zones**: `ZONE_CENTER` (6 coarse centers) · phyllotaxis `packed()` · `PERSON_POS`/`PROJECT_POS` · `TEAM_ZONES` (incl. `labelPos` above each cluster) |
| `src/data/nexusLayout.ts` | `NEXUS_POS` (pct→board via `toBoard`) · `NEXUS_CARD_ANCHORS` (result cards anchored beside cluster) · `NEXUS_BRIEF_POS` (now unused — brief is HUD; safe to delete) |
| `src/components/PanZoomCanvas.tsx` | shared rzpp wrapper; `forwardRef` + `board` prop (per-scene dims) |
| `src/lib/useRailCamera.ts` | derived camera: fits a board bbox into a HUD-safe rect; first apply instant, then animated; re-fits on resize |
| `src/components/scenes/DashboardScene.tsx` | world (surface+edges+zone labels+nodes) in PanZoomCanvas; HUD (tag bar, weather text, alerts, composer) outside; `DASHBOARD_INSETS` full-bleed |
| `src/components/scenes/NexusScene.tsx` | world (surface+flow+result cards in `CardSlot`) in PanZoomCanvas; HUD (brief, inspector corner, advance) outside; `NEXUS_INSETS` full-bleed |
| `src/components/SvgEdgeLayer.tsx` / `NexusScene` `NexusEdgeLayer` | board-sized `viewBox` (no `preserveAspectRatio`) |
| `src/styles/global.css` | board surface, zone labels, briefing/nexus-brief HUD, inspector corner-chrome, card slots |

## 3 · Tunable knobs (where to nudge, by symptom)
- **Cluster spread / overlap** → `CLUSTER_STEP` (172) and `ZONE_CENTER` (6 centers) in `layout.ts`. Centers are the only hand-placed numbers; everything else is formula.
- **Project sits wrong vs owner** → `PROJECT_OFFSET` in `layout.ts`.
- **Map too big/small or off-center at open** → `DASHBOARD_INSETS` / `NEXUS_INSETS` (scene files) + `useRailCamera` options (`maxFitScale`, `padding`).
- **Team label position/size** → `labelPos` formula (`layout.ts`, `center.y - clusterMaxRadius - 96`) + `.team-zone-label` CSS.
- **Nexus step framing (cluster+card)** → `NEXUS_CARD_ANCHORS` (pos + half) in `nexusLayout.ts`.
- **Node legibility (weather-forward)** → `.scene-dashboard .person-node` / `.flow-node` CSS sizes.

## 4 · Open threads / not-yet-addressed
- **Awaiting founder feedback** — next concrete task undecided. Likely candidates: node visual polish (weather-forward HP/MP emphasis), zone-center balance on the bigger canvas, transition feel between calm↔focus, Nexus card anchor tuning.
- **Composer expand jank (①)** — pre-existing, NOT touched this round; prior session suspected dev-mode StrictMode + unminified Vite; verify with `npm run preview`, not `dev`.
- **`NEXUS_BRIEF_POS`** in `nexusLayout.ts` is now dead (brief is HUD) — delete on next cleanup.
- **Responsive `@media` blocks** in `global.css` still carry old world-object `vw`/clamp overrides for small screens — out of demo scope (large screen), left as-is; revisit only if small-screen matters.
- **Not committed** — see commit message provided in chat. Working tree also has pre-existing `M` from earlier sessions.

## 5 · Verify / run
- typecheck: `npm run typecheck` · build: `npm run build`
- dev (visual): `npm run dev` → http://localhost:5173/ . **Visual QA is the user's job — do not run playwright/screenshots; run the server and let them eyeball.** Rail keys: `→`/Space advance, `←` back, `R` restart, `H` hide caption.

## 6 · Suggested skills
- Resume / re-decide direction: **/grill-with-docs** (this round used it heavily; decisions are dense in ADR 修订2–4 — grill new asks against them before coding).
- Visual iteration: **/run** (start dev, let user eyeball) — keep the server up for hot-reload, don't self-verify visuals.
- If pan/zoom or camera misbehaves: **/diagnose** (instrument before changing).
- Wrap-up after changes: **/code-review** (coordinate-system + new dep surface is large).

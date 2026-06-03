# TeamMaster Dashboard + Nexus Static Prototype

This is a standalone angel-presentation prototype. It does not import production
Next.js code, call backend APIs, or persist state.

## Run

Open `prototype/dashboard-nexus/index.html` directly in a browser.

## What It Demonstrates

- Ambient dashboard canvas with people, projects, and SVG relationship edges.
- Unified focus model for person and project nodes.
- Dashboard composer handoff into a staged Nexus orchestration flow.
- Step-by-step Nexus story with reset, back, next, and autoplay controls.
- Motion built on transform and opacity, with `prefers-reduced-motion` support.

## Presentation Target

This prototype is fullscreen-first. Narrow screens intentionally show a desktop
presentation notice instead of trying to compress the whiteboard metaphor. A
mobile/narrow version should use a different rendering model later.

## Boundaries

- No whiteboard SDK.
- No drag editing.
- No backend integration.
- No production `src/` imports.
- No app route, auth, middleware, or package script changes.

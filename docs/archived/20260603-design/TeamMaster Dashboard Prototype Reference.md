
## Goal

Build a **prototype-quality infinite-canvas style dashboard** on top of the existing dashboard page.

This is not a full production whiteboard product. The priority is:

1. Safe visual display
    
2. Smooth animation
    
3. Strong UI/UX storytelling
    
4. Clear project/person/task relationship preview
    
5. Minimal engineering risk
    

Do not over-engineer full whiteboard editing, collaboration, persistence, drag-and-drop editing, complex graph algorithms, or full business logic.

## Core Design Concept

The prototype should feel like:

> A calm ambient dashboard that reveals project relationships through a lightweight canvas-like spatial layer.

It should not feel like a generic Miro clone or a full task-management app.

The intended hybrid direction:

- Spatially: like a lightweight whiteboard / canvas
    
- Semantically: like a project management dashboard
    
- Focus behavior: like a graph relationship explorer
    
- Information density: closer to Notion-style structured cards
    
- Visual relationship language: subtle, curved, slightly organic connector lines
    

## Product References to Borrow From

Use these as conceptual references, not exact UI copies.

### Obsidian Canvas / JSON Canvas

Borrow:

- Node + edge mental model
    
- Cards arranged in space
    
- Lightweight relationship graph
    
- Groups / clusters / connected objects
    

Do not copy:

- Knowledge-base look
    
- Heavy graph-exploration complexity
    

### Miro / FigJam / Whimsical

Borrow:

- Multi-object canvas feeling
    
- Clear visual relationships
    
- Lightweight connection lines
    
- Smooth object focus transitions
    
- Low-friction spatial organization
    

Do not copy:

- Full freeform whiteboard tools
    
- Sticky-note-heavy meeting-board style
    
- Complex editing toolbar
    

### Excalidraw

Borrow:

- Soft, friendly, slightly hand-drawn connector feeling
    
- Curved arrows / relation lines
    
- Lightweight visual warmth
    

Do not copy:

- Full sketchy hand-drawn UI
    
- Rough marker-card style
    

### Notion Projects

Borrow:

- Clean information hierarchy
    
- Compact project cards
    
- Clear title/status/progress/owner/due-date layout
    
- High-density but readable card structure
    

Do not copy:

- Table/database UI
    
- Pure document/sidebar layout
    

## Recommended Technical Direction

Use the existing dashboard shell. Do not replace it with a full whiteboard SDK.

Preferred approach:

- Keep current `AmbientHome` / `AmbientCanvas` style shell
    
- Add a lightweight `ProjectLayer`
    
- Optionally add a small `TaskLayer` only during project focus
    
- Render cards with normal DOM
    
- Render connector lines with one SVG layer
    
- Manage focus with one unified focus state
    

Recommended rendering stack:

```ts
DOM cards + single SVG edge layer + CSS/Motion animations
```

Avoid for this prototype:

- Full React Flow implementation unless already easy to integrate
    
- tldraw as the main app shell
    
- PixiJS / WebGL
    
- Full drag-editable whiteboard behavior
    
- Persistent canvas editing model
    
- Complex graph layout engine as a hard dependency
    

## Reliable Components / Libraries

Use existing components where possible.

Good candidates:

### Animation

Prefer:

- `framer-motion` / `motion`
    
- CSS transitions for simple opacity/transform
    
- `prefers-reduced-motion` support
    

Animation goals:

- Smooth focus transition
    
- Fade non-related objects
    
- Scale/expand cards gently
    
- Avoid jumpy layout changes
    
- Avoid heavy blur or expensive shadows everywhere
    

### Positioning / Overlay

Use:

- `Floating UI` if tooltip/preview positioning becomes tricky
    
- Simple custom positioning if cards are fixed around orbit positions
    

### Layout

For prototype, prefer deterministic handcrafted layout.

Use simple rules:

- People remain in orbit
    
- Projects appear near their owner
    
- Unassigned projects appear in a separate small cluster
    
- Tasks only appear when a project is focused
    

Only consider Dagre/ELK if task dependency graph becomes necessary.

### Connectors

Use custom SVG paths.

Preferred connector style:

- Quadratic Bezier curve
    
- Thin line
    
- Low opacity in calm state
    
- Stronger opacity when focused
    
- Unrelated lines fade down
    
- Avoid dense line spaghetti
    

Example visual behavior:

- Calm: faint project-owner lines
    
- Hover: related line gets clearer
    
- Focus: selected person/project pair is emphasized
    
- Other edges become subtle background
    

## Component Structure

Suggested prototype structure:

```txt
AmbientHome
  AmbientCanvas
    PeopleOrbitLayer
    ProjectLayer
      SvgEdgeLayer
      ProjectPreviewCard
      ProjectFullCard
    TaskLayer
    BriefingLayer
    ComposerLayer
    AlertPillLayer
```

Do not put all logic into one giant component if avoidable.

## Focus Model

Use one unified focus state.

```ts
type CanvasFocus =
  | { kind: 'person'; id: string }
  | { kind: 'project'; id: string }
  | { kind: 'task'; id: string; projectId: string }
  | null;
```

Prototype can start with only:

```ts
type CanvasFocus =
  | { kind: 'person'; id: string }
  | { kind: 'project'; id: string }
  | null;
```

Rules:

- Clicking a person focuses that person
    
- Related projects become more visible
    
- Unrelated people/projects fade
    
- Clicking a project opens a larger project card
    
- ESC or blank canvas click clears focus
    
- Composer/alerts can fade back during deep focus
    

## Visual Behavior

### Calm State

Show:

- Ambient dashboard background
    
- People orbit
    
- Subtle project chips/cards near owners
    
- Very faint relationship lines
    
- Minimal text density
    

Do not show:

- All task details
    
- Complex dependency graph
    
- Large panels everywhere
    

### Person Focus

Show:

- Selected person identity emphasis
    
- Their related project preview cards
    
- Clearer owner-project lines
    
- Other objects dimmed but still visible
    

### Project Focus

Show:

- Full project card
    
- Owner relationship line
    
- Status/progress/due/owner info
    
- Optional small task summary
    
- Optional top 3 important tasks
    

Do not show all tasks unless visually safe.

### Task Focus

Optional. Only implement if easy.

Show:

- Task chip/card
    
- Relationship to project
    
- Maybe assignee/status
    

## Visual Style Constraints

Keep the existing dashboard atmosphere:

- Calm
    
- Ambient
    
- Premium
    
- Paper-like
    
- Spatial
    
- Not too SaaS-table-heavy
    
- Not too whiteboard-tool-heavy
    

Use restrained contrast.

Recommended visual hierarchy:

- Focused object: full opacity, stronger shadow, slightly larger
    
- Related object: medium-high opacity
    
- Unrelated object: low opacity, but not disabled-looking
    
- Lines: subtle by default, clearer only on hover/focus
    

Avoid:

- Too many bright colors
    
- Thick connector lines
    
- Dense labels
    
- Overlapping cards
    
- Heavy glassmorphism everywhere
    
- Large modal panels that break the canvas feeling
    

## Performance Rules

Prototype must feel smooth.

Important constraints:

- Use transform/opacity for animation
    
- Avoid layout thrashing
    
- Avoid animating width/height when transform can work
    
- Keep only one SVG edge layer
    
- Do not render every task in calm state
    
- Do not use huge shadows/blur on every small chip
    
- Memoize layout calculations if needed
    
- Keep DOM count modest
    

For prototype, optimize for:

- 10–20 people
    
- 10–40 projects
    
- Only a few visible task cards at once
    

## Scope Boundaries

Must build:

- Safe whiteboard-like dashboard display
    
- Person/project spatial relationship
    
- Smooth focus animation
    
- Faint SVG connector lines
    
- Project preview/full card states
    
- Clean fallback if data is missing
    
- No crash on empty projects / unassigned projects
    

Nice to have:

- Task summary under focused project
    
- Simple task chips
    
- Edge hover effect
    
- Reduced motion support
    

Do not build now:

- Full whiteboard editor
    
- Drag-to-create nodes
    
- Persistent node positions
    
- Real-time collaboration
    
- Infinite zoom system
    
- Full graph layout engine
    
- Full task dependency editor
    
- Complex permissions model
    
- Complete backend integration beyond mock/API-safe data shape
    

## Data Handling

Use mock data if backend data is not ready.

Expected basic entities:

```ts
type Person = {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
};

type Project = {
  id: string;
  title: string;
  status?: 'on-track' | 'at-risk' | 'blocked' | 'done';
  progress?: number;
  ownerMemberId?: string;
  ownerName?: string;
  dueDate?: string;
  summary?: string;
};

type Task = {
  id: string;
  projectId: string;
  title: string;
  status?: string;
  assigneeId?: string;
};
```

Owner resolution:

1. Prefer `ownerMemberId`
    
2. Fallback to exact `ownerName`
    
3. Otherwise put project into `Unassigned` cluster
    

## Implementation Priority

Build in this order:

1. Keep existing dashboard shell stable
    
2. Add project mock/API data
    
3. Add ProjectLayer with static cards
    
4. Add SVG owner-project connectors
    
5. Add unified focus state
    
6. Add smooth focus/dim animation
    
7. Add project full card
    
8. Add optional task preview only inside project focus
    
9. Polish spacing, opacity, edge cases
    
10. Add reduced-motion fallback
    

## Success Criteria

The prototype is successful if:

- The first screen still feels like the existing dashboard
    
- Project relationships are visually understandable
    
- Focus transitions feel smooth and intentional
    
- Cards do not overlap badly
    
- Empty/missing data does not break the scene
    
- The demo tells a clear story without requiring full backend logic
    
- The code remains small enough to safely iterate
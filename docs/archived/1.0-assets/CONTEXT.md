# teamMaster

A human–AI copilot for SMB CEOs and their teams: ingests company context (org, projects, external docs, daily signals), produces ambient awareness of "how is the company today", and answers operational questions through a small cast of role-specialized AI counterparts.

## Language

**Agent**:
One of the role-specialized AI counterparts a user converses with in Nexus — currently 5 personas (Strategy, Legal, Finance, Ops, Comms), each with its own system prompt, expertise tags, and a stable `agent-*` ID persisted on conversations and messages.
_Avoid_: bot, AI assistant. The code internally uses `AgentPersona`; in product copy and docs say **Agent**.

**Skill**:
A registered, schema-validated function-calling tool that an Agent invokes to return a structured artifact (todo / doc / chart / mermaid / slide / ask). Each one lives in `src/lib/skills/<id>/` as a folder with `SKILL.md` + `schema.ts` + `index.ts`, and is registered through `src/lib/skills/registry.ts`. The harness builds the OpenAI tool defs and validates outputs generically.
_Avoid_: artifact tool, function tool (in product/doc surface).

**Nexus**:
The conversational surface of teamMaster — the routes under `/nexus`, where Agents speak, Skills render artifacts, and human-to-human DMs also live. Distinguish from `/dashboard` (ambient survey) and `/tasks` (dispatched work board). A conversation has **no stored `kind`** — its type (agent thread vs human thread) is derived from participants (`agentId` vs `memberIds[]`) via `inferConversationLabel`, after the `kind` column was dropped per AgDR-0009.

**Pre-flight Agent routing**:
The decision — made **once per conversation, on submit** — of which Agents (≤3) should answer a Nexus turn. `src/lib/skills/route-agents.ts` (AgDR-0010) makes one `chatJson` call (`callSite='nexus-route-agents'`) that picks Agents with one-sentence reasons, always backed by a keyword-regex fallback (callers see `source: 'llm' | 'fallback-regex'`). A client-side regex drives the keystroke-time **pre-flight tray** preview; only the final submit hits the server LLM path, and the tray disappears after the first turn — so cost is bounded to one routing call per conversation lifetime. `pinnedAgents` always override; the cap is 3.
_Avoid_: "agent picker" — routing is a deep module with an LLM + regex fallback, not a static dropdown.

**Listen mode**:
A per-conversation toggle (`conversations.listen_mode`, AgDR-0011) governing how Agents behave in a thread that contains ≥1 human. `2` = **Auto-reply** (default) — Agents persist normal messages. `1` = **Listening** — Agents emit ephemeral **Thought** SSE events instead of writing message rows, so they observe a human-to-human thread without cluttering it. The UI toggle is shown only when a human is in the participant set.

### Memory

teamMaster stores context across conversations in three layers. Both forms — numbered (L0/L1/L2) and named (Org Portrait / Conversation Memory / Entity Memory) — are canonical. The numbering encodes scope hierarchy: org → conversation → entity.

**L0 — Org Portrait**:
A single text string per organization, derived once at onboarding by an LLM summarizing the pipeline outputs (`organizations.portrait_text`). Auto-injected into Nexus DM and Tasks-decompose system prompts. Static — does not update from ongoing signals.

**L1 — Conversation Memory**:
A namespace + scope-key keyed store of semantic facts extracted from chat turns, indexed by 1024-dim cosine vectors (`conversation_memories`). Retrieved by similarity to the current question. Namespaces today: `agent-dm`, `task-decompose`. Per AgDR-0009 the `agent-dm` namespace is scoped per `conversationId` so all Agents in a thread share extracted memories; the legacy per-agent-keyed scope (`nexus:${persona.id}` + `memberId`) and the older `nexus-channel` namespace are no longer written to but may still appear in historical rows. TTL 30 days.
_Avoid_: "chat history" — message rows are the chat history; L1 is what's been *extracted* from them.

**L2 — Entity Memory**:
A per-entity (person or project) recency-ordered log of analyses (`entity_memories`). Read pattern is `ORDER BY created_at DESC LIMIT N` — not semantic — because the consumer (digital-twin recompute) cares about recent trend. Cap-on-insert, no TTL. Writer today: `digital-twin/compute.ts` for `person` rows.

**Digital Twin**:
A per-team-member operational model: current `healthScore` + `bandwidthUtilization` (computed from the last 7 days of signals + reality gaps) plus a stream of weekly sentiment / output summaries (written to L2 Entity Memory). Live state lives in `digital_twin_cache`; historical analyses live in L2. Computed by `src/lib/digital-twin/compute.ts`. **Not** the same as L0 Org Portrait: Twin is per-person and continuously updated; Portrait is org-wide and derived once.

### Observability

**Signal**:
A typed observation of work happening, recorded into `artifact_signals` (legacy table name — see Flagged ambiguities). Five kinds in the schema enum: `file_revision` (wired — External Brain source mutations), `nexus_message` (wired — Nexus messages), and the placeholders `commit` / `slack_message` / `ticket_update` (no integration yet, kept in the enum so adding each later doesn't migrate the column). Each Signal has a `memberId`, optional `projectId`, a timestamp, and a kind-specific JSON payload. Signals are the *input* surface to teamMaster — what happened in the world.
_Avoid_: "event" (overloaded), "artifact" alone (collides with Skill output).
_Historical_: `report_claim` was removed when CEO self-reports moved from a synthetic signal source to direct Nexus chat.

**Artifact**:
A Skill's structured output, persisted in `agent_artifacts` and mirrored onto the producing message's `metadata.artifacts` (payload included — see AgDR-0016). Six shapes today: `todo`, `doc`, `chart`, `mermaid`, `slide`, `ask`. Artifacts are the *output* surface — what an Agent decided. An Artifact has two deliberately-separated UI homes: it **renders inline** in the thread, beneath the producing Agent message — the actual diagram / chart / checklist (see AgDR-0017); the Inspector's **Artifacts cards are an index**, not the render — clicking one scrolls to (and highlights) the inline render in the thread.
_Avoid_: calling the Inspector card "the artifact" — the card is a pointer; the render lives in the thread bubble.

**Reality Gap**:
A rule-detected anomaly over the activity window of `artifact_signals`. Detection is **pure rules — zero LLM calls**, see `src/lib/signals/reality-gap.ts`. Two kinds (encoded as text in `reported_claim`): `silent_member` (an active member with no signals in the 48-hour window) and `collaboration_orphan` (a `nexus_message` @-mentions a member who has no signals in the same window). Each has a severity (`info | warning | critical`) and a status (`active | reviewed | dismissed | resolved`).
_Historical_: `report_mismatch` and `project_drift` were retired together with `report_claim` when CEO self-reports moved into Nexus chat — see ADR-0005 §addendum.
_Demo note_: the `projects.driftFlag` column (a still-present schema field, currently **mock-populated** — there is no live detector writing it) is surfaced on the `/dashboard` project-layer prototype under the same "Reality Gap" UI label (`reportedClaim` vs `aiEvidence`). This is a display reuse of the label, **not** a second live detection source.

### Surfaces

The product is split into two visual / interaction registers. The split is by **what the page's core job is**, not by who can see it (manager-only is just access control and does not decide register).

**Ambient surface**:
The pages whose core job is first-impression, conversation, or work-in-flight: `/dashboard` (orbit + briefing), `/nexus` (conversations), `/tasks` (board / list). Visual register: low density, radial bloom + ambient text, single-CTA composer, no sidebar/header chrome (per ADR-0001 §3.6). The top nav `Home · Talk · Tasks` lives here. Some Ambient pages are `requireManager` (e.g. `/dashboard`) — that is access control, not a register switch.

**Admin surface**:
The pages whose core job is querying or changing organisation configuration: `/team` (members, projects, plus the in-page re-onboarding diff card), and the `/settings` 4-tab one-stop — persona / account / capabilities (knowledge-pack subscriptions + 30d usage) / models (model selection + token usage). Track A3 (#41) collapsed the standalone `/models` and `/settings/capabilities` routes into Settings tabs; both old URLs still 302-redirect to `?tab=…` for backwards compatibility. Visual register: dense tables / editable lists, conventional form chrome. **Not** reachable from the main nav — entered exclusively via the top-right user-menu (per ADR-0001 §3.8 / AgDR-0013). The `/team` entry has a dual placement (main nav for manager use + user-menu), kept deliberately per #42 — every other Admin destination is user-menu only. Always `requireManager`-gated, but the gating is incidental to the register — the register is "this is a configuration page".

_Avoid_: "/admin/* shell" (a third register was rejected in ADR-0009), "manager-only pages" (overloaded — covers both Ambient `/dashboard` and Admin `/team`).

## Relationships

- A **Nexus** conversation has one or more **Agents** as participants.
- An **Agent** can call zero or more **Skills** during a turn; each Skill emits one validated artifact.
- A **Skill** is invoked by the LLM as a function tool; the harness validates the payload before the artifact reaches the UI.
- An **Agent**'s system prompt is built from: persona text + **L0 Org Portrait** + retrieved **L1 Conversation Memory** + (where the conversation is about a person) the relevant **Digital Twin** snapshot.
- A **Digital Twin** emits one **L2 Entity Memory** row per analysis run.
- **Signals** feed both **Reality Gap** detection (pure rules) and **Digital Twin** computation (healthScore penalties).
- A **Skill** produces an **Artifact**. **Signals** are not Artifacts — they flow the opposite direction (input vs output).

## Example dialogue

> **Reviewer:** "When the Strategy **Agent** answers, can it also dispatch a task?"
> **Builder:** "Only by calling the `todo` **Skill** — the resulting todo artifact has an `assign` button that fires `/api/tasks/from-nexus`. The Agent never writes to Tasks directly; the Skill is the only side-effect surface."

## Flagged ambiguities

- **"Agent"** also means Claude Code itself (the AI coding agent authoring this repo). When ambiguity could arise in writing, qualify: write **"coding agent"** or **"Claude Code"** for the developer-side meaning; **"Agent"** unqualified always refers to the Nexus persona.
- **"Skill"** is overloaded: `SKILL.md` files exist in *both* `src/lib/skills/<id>/SKILL.md` (Nexus skill, this codebase's product concept) and `.claude/skills/<name>/SKILL.md` (Claude Code skill — Anthropic slash commands like `/grill-with-docs`, `/prototype`). They share a filename but are unrelated mechanisms. When ambiguous, write **"Claude Code skill"** or use the slash form (`/grill-with-docs`) for the Anthropic concept; **"Skill"** unqualified always refers to the Nexus tool.
- **"Artifact"** in code is overloaded: the table `artifact_signals` and the TS type `ArtifactSignal` predate the conceptual split above and refer to **Signals**, not **Artifacts**. The product canonical names are **Signal** (input observation) and **Artifact** (Skill output). The legacy code names stay until a future rename refactor. When reading code, the rule is: anything in `src/lib/signals/`, the `artifact_signals` table, or named `ArtifactSignal` is a **Signal**; anything in `src/lib/skills/`, the `agent_artifacts` table, or returned from a Skill is an **Artifact**.

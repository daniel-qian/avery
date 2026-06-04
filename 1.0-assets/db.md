<!--
  Generated-from: src/lib/db/schema.ts (table inventory), src/lib/db/migrations/* (migration list),
                  src/lib/db/client.ts (connection), package.json (db:* scripts)
  Companion docs:  ./data.md (per-column detail), ./dev-commands.md (full command surface)
  When this drifts: stage src/lib/db/schema.ts or package.json → the docs-staleness hook will remind you.
-->

# Database reference

Everything about the teamMaster database — the stack, the table inventory, day-to-day commands, and the operational invariants. For per-table internals (column shapes, sample rows, upstream/downstream) jump to [`data.md`](./data.md). For the full command surface (RAG / signals / dev server / SSE debug) see [`dev-commands.md`](./dev-commands.md).

---

## 1. Stack at a glance

| Concern | Choice | Source |
|---|---|---|
| Engine | Postgres 17 + `pgvector` | `pgvector/pgvector:pg17` Docker image |
| ORM | drizzle-orm | `src/lib/db/client.ts` |
| Driver | postgres-js (`postgres`) | same |
| Schema source of truth | `src/lib/db/schema.ts` | one file, 25 tables |
| Migrations dir | `src/lib/db/migrations/` | drizzle-kit emits SQL here (`0000`–`0013` today) |
| Migration tool | drizzle-kit `generate` + `scripts/apply-migrations.ts` | dev (esp. Windows) = `generate` → `db:migrate`; `db:push` works on macOS/Linux only — see §6 |
| Vector index | ivfflat / cosine (`vector_cosine_ops`) | per RAG / chunk table |
| Vector dimension | **1024** (DashScope `text-embedding-v4`) | `EMBEDDING_DIMENSIONS` env, `src/lib/embeddings.ts` |
| Connection | `DATABASE_URL=postgresql://postgres:dev@localhost:5432/teammaster` | `.env.local` (Node-dev) or `.env` (Docker app) |
| Auth column | `team_members.password_hash` (bcryptjs) + `iron-session` cookie | `src/lib/auth/` |
| Repos | one file per table | `src/lib/db/repos/*.ts` |

Two parallel run modes share the same DB schema:

- **Docker bundled** (default user path) — `docker compose up` brings up postgres + the Next.js app together; reads `.env`.
- **Local Node** (contributor path) — `pnpm run db:up` starts only postgres, `pnpm run dev` runs Next.js on the host; reads `.env.local`.

The schema, migrations, and seed scripts are identical between modes; only the env file changes.

---

## 2. Quick start

```bash
pnpm install
cp .env.local.example .env.local       # then fill in DEEPSEEK_API_KEY, DASHSCOPE_API_KEY, SESSION_SECRET
pnpm run db:reset:full                  # nuke volume → wipe public+drizzle → apply migrations → seed org/members/projects → sync RAG → seed 30d signals
pnpm run dev                            # http://localhost:3000
```

`db:reset:full` ends by printing a credentials table; sign in at `/login` with one of those (managers get `/dashboard`, employees land on `/tasks`).

If you'd rather start empty and walk through onboarding yourself, run `pnpm run db:reset` (no demo data) — `/onboarding` will bootstrap the first manager.

Required env (full list lives in `dev-commands.md`):

```bash
DATABASE_URL=postgresql://postgres:dev@localhost:5432/teammaster
DEEPSEEK_API_KEY=sk-...
DASHSCOPE_API_KEY=sk-...
SESSION_SECRET=...                      # ≥32 chars, generate via `openssl rand -base64 48`
```

---

## 3. Table inventory

25 tables, grouped by domain. One-line summaries below — for column shapes and example rows see [`data.md`](./data.md).

### Org / people / work
| Table | Purpose |
|---|---|
| `organizations` | Single tenant root row; every other table FKs back here via `org_id`. Phase 1: carries the L0 org-context portrait (`portrait_text` + `portrait_generated_at`) derived at end of onboarding and injected into Nexus DM + Tasks decompose. |
| `team_members` | People in the org. Holds the auth columns: `access_role` (`manager`/`employee`), `password_hash` (bcryptjs), `must_change_password`. |
| `member_invites` | One-time invite tokens (text PK) so a manager can invite an existing `team_members` row to set a password. Created by `POST /api/team/invite`, consumed by `POST /api/auth/set-password`; rows kept after use for audit. |
| `user_preferences` | Per-member UI / Nexus persona settings (`nexus_tone`, `proactivity`, `theme`, `font_scale`). One row per member, lazily created on first GET. |
| `projects` | Work streams; carries an optional `drift_flag` payload. |
| `goals` | Decomposition source for tasks (manual or dashboard-derived). |
| `tasks` | Atomic work, optionally linked to a goal/project; carries an LLM `delegation_suggestion`. `source_message_id` (Phase 3a) deep-links Nexus-born tasks back to their originating message; `ON DELETE SET NULL` so deleted messages don't cascade. |

### Conversations (Nexus)
| Table | Purpose |
|---|---|
| `conversations` | Nexus threads. There is **no `kind` column** — it was dropped in migration `0012_wise_blazing_skull` (AgDR-0009); thread type is derived from participants (`agent_id` present ⇒ Agent thread, `member_ids[]` ⇒ human thread; see `inferConversationLabel`). `listen_mode` (added in `0013`, AgDR-0011): `1` = Listening (Agents emit ephemeral Thought SSE, no rows), `2` = Auto-reply (default). |
| `messages` | One row per CEO/agent/human message; agent rows may include `metadata.ragSources` / `metadata.artifacts`. |
| `agent_artifacts` | Structured Nexus skill outputs (todo/doc/chart/mermaid/slide/ask), bound to the producing message; `payload` jsonb is shaped per-skill. |

### RAG (two knowledge bases)
| Table | Purpose |
|---|---|
| `rag_modules` | The 6 company-curated AI module IDs (HR-STRATEGY, HR-DECISION, …). |
| `rag_module_entries` | 70 tools + cases, each with a 1024-dim embedding (ivfflat cosine). |
| `external_brain_sources` | User-uploaded documents (pdf/docx/txt) — metadata, indexing status, storage key. |
| `external_brain_chunks` | The 600-token chunks of each source (ivfflat cosine). |
| `routing_decisions` | One row per Nexus query — which modules were selected, weights, reasoning. |

### Signals / reality / digital twin
| Table | Purpose |
|---|---|
| `artifact_signals` | 5 polymorphic signal types with per-type payload jsonb: `file_revision` + `nexus_message` are **wired**; `commit` / `slack_message` / `ticket_update` are kept-in-enum **placeholders** (no integration yet). `report_claim` was removed. |
| `reality_gaps` | Pure-rules detections over signals — **2 live kinds**: `silent_member` / `collaboration_orphan` (see `src/lib/signals/reality-gap.ts`). `report_mismatch` + `project_drift` were retired with `report_claim`. **No LLM**. |
| `digital_twin_cache` | Per-member `healthScore` / `bandwidth` / `sentiment` / `summary`, 4-hour TTL (route-side check; the table itself has no expires column). |

### Memory
| Table | Purpose |
|---|---|
| `conversation_memories` | **L1** — distilled durable facts extracted post-turn from Nexus DM and Tasks decompose. Namespaced by `(namespace, scope_key)` — Nexus uses `nexus:{agentPersonaId}` per `memberId`, decompose uses `task-decompose` per `orgId`. Vector(1024) cosine ivfflat for retrieval. `kind` reserves `'summary'` for a future rolling-summary persistence; today writes only `'fact'`. TTL via `expires_at` default (30 days) + query-time filter; sweeper via `pnpm run memory:sweep`. |
| `entity_memories` | **L2** — per-(person\|project) recency-ordered log of weekly digital-twin analyses. Keyed by `(orgId, entityType, entityId)`. Read pattern is `ORDER BY created_at DESC LIMIT N` (NOT semantic search); btree index `(orgId, entityType, entityId, createdAt DESC)`. Writer in Phase 3: `digital-twin/compute.ts` (person rows only; `'project'` is reserved for a future call site). Retention: cap-on-insert at 20 rows per entity (`ENTITY_MEMORY_CAP`), no TTL. Embedding column exists nullable for a future semantic mode; not populated on write today. |

### Operational
| Table | Purpose |
|---|---|
| `re_onboarding_runs` | Status of background re-onboarding jobs surfaced in Settings. |
| `notifications` | In-app notifications (`dm_message` / `mention` / `task_assigned`); consumed by the shell `NotificationTray` (polls `GET /api/notifications`). |
| `llm_usage` | One row per LLM call (`provider` ∈ deepseek / dashscope-chat / dashscope-embedding / dashscope-vlm, model, kind, callSite, tokens, USD-micro cost, latency). Powers the Models tab at `/settings?tab=models`. |

### Repository layer

Most tables have a thin file under `src/lib/db/repos/*.ts` (~23 today) exposing query helpers; a few (`member_invites`, `notifications`, `llm_usage`) are queried inline from their routes/wrappers. Routes call repos rather than building drizzle queries inline; keep new query patterns in the repo so they can be reused.

---

## 4. Commands

> Full grouping with troubleshooting is in [`dev-commands.md`](./dev-commands.md). The DB-relevant subset:

### Containers

| Command | What it does |
|---|---|
| `pnpm run db:up` | Start the postgres container only (volume preserved). |
| `pnpm run db:down` | Stop the container, **keep the volume**. |
| `docker compose down -v` | Stop **and** wipe the volume. Used by `db:reset*`. |

### Schema lifecycle

| Command | What it does |
|---|---|
| `pnpm run db:wait` | Block until postgres accepts connections (chained by reset). |
| `pnpm run db:init` | `CREATE EXTENSION IF NOT EXISTS vector;` — required by pgvector. |
| `pnpm exec drizzle-kit generate` | Emit a versioned SQL file (`00NN_*.sql` + snapshot) under `src/lib/db/migrations/` from `schema.ts`. **Day-to-day schema iteration on Windows** + prod migrations. |
| `pnpm run db:migrate` | Apply pending migrations via `scripts/apply-migrations.ts` (postgres-js driver, hash-tracked in `drizzle.__drizzle_migrations`). Pairs with `generate`. |
| `pnpm run db:push` | `db:init` + `drizzle-kit push` — applies `schema.ts` directly. **macOS/Linux only** — hangs silently on an interactive Windows console (§6). |
| `pnpm run db:migrations:bootstrap` | Register already-applied migrations into `drizzle.__drizzle_migrations` (idempotent; recovery aid — see §6). |
| `pnpm run db:studio` | Drizzle Studio at <https://local.drizzle.studio> — every table browsable / editable. |

### Demo data

| Command | What it does |
|---|---|
| `pnpm run db:seed` | 1 org (Meridian Group) + 7 members + 5 projects + seeded conversations/messages. Bcrypts `demo-manager` / `demo-employee` per access role and prints a credentials table. |
| `pnpm run rag:sync` | Incrementally loads 10 hr-tools + 60 ui-scale-cases into `rag_module_entries`. Hash-dedupes — safe to rerun. |
| `pnpm run db:seed:signals` | ~3,000 `artifact_signals` (`file_revision` + `nexus_message`) across 30 days + scripted drama (James Whitfield silenced → `silent_member`; an @-mention of him → `collaboration_orphan`) + derived `reality_gaps`. |

### Reset everything

| Command | What it does |
|---|---|
| `pnpm run db:reset` | down -v → up → wait → **wipe → init → migrate** (`apply-migrations`, not `push`). Empty schema, no demo data — boots into onboarding. |
| `pnpm run db:reset:full` | `db:reset` + `db:seed` (`seed-demo-org`) + `rag:sync` (`sync-ai-modules`) + `db:seed:signals` (`seed-signals-history`). Full demo from scratch. |

`db:reset:full` is the canonical "give me a working demo" command. Takes ~60–90s end-to-end on a warm Docker.

---

## 5. Inspecting data

```bash
pnpm run db:studio          # Drizzle Studio — visual table browser
docker exec -it teammaster-postgres-1 psql -U postgres -d teammaster   # raw psql
```

Useful one-liners inside psql:

```sql
\dt                                                 -- list all 25 tables
SELECT count(*) FROM artifact_signals;              -- expected ≥ 200 (~3000 in seed:full)
SELECT email, access_role FROM team_members WHERE password_hash IS NOT NULL;
SELECT call_site, count(*) FROM llm_usage GROUP BY 1 ORDER BY 2 DESC;
```

For "is the seed data healthy?" use the integrity checklist in [`data.md`](./data.md) §10.

---

## 6. Migrations strategy

Dev uses `drizzle-kit push` — diff `schema.ts` against the live DB and apply directly. Fast, but no per-version SQL artifacts.

For **prod** (or any time you want a reviewable diff), run `pnpm exec drizzle-kit generate` to emit a numbered SQL file under `src/lib/db/migrations/`. Current versioned files run `0000`–`0013` (14 migrations). Notable ones: `0000_big_mathemanic` (baseline), `0001_yielding_lyja` (personal-scope visibility/owner + `user_*_preferences`), `0002_common_thunderbolts` (`agent_artifacts`), `0008` (`conversation_memories`), `0010_drop_channel_kind` (retargeted legacy `kind='channel'` rows + added a CHECK constraint), `0012_wise_blazing_skull` (**dropped the `conversations.kind` column** — type is now derived from participants, which also removed the CHECK), `0013_melodic_scarlet_spider` (added `conversations.listen_mode`). Run `pnpm exec drizzle-kit generate` to confirm the snapshot matches `schema.ts`; the exact current list is whatever sits in `src/lib/db/migrations/*.sql`.

Tracked applied migrations live in `drizzle.__drizzle_migrations` (id serial, hash text, created_at bigint). `pnpm exec drizzle-kit migrate` reads pending entries from `meta/_journal.json`, hashes each `.sql` file with SHA-256, and inserts the row when a statement block runs. Day-to-day dev uses `db:push` (which ignores this table); the table only matters if you switch to a migrate-based deploy or need to verify "what has this DB seen".

### Windows / Git Bash fallback

Both `drizzle-kit push` and `drizzle-kit migrate` occasionally hang forever at *"Pulling schema from database…"* / *"applying migrations…"* on Windows / Git Bash / PowerShell (TTY issue, not a connectivity problem).

`db:reset` / `db:reset:full` no longer go through drizzle-kit at all — they apply versioned migrations via `pnpm run db:migrate` (`scripts/apply-migrations.ts`), which uses the `postgres` driver directly and is hash-tracked in `drizzle.__drizzle_migrations`. No TTY hang.

For day-to-day schema iteration on Windows: edit `schema.ts` → `pnpm exec drizzle-kit generate` (writes a new `00NN_*.sql` plus snapshot under `src/lib/db/migrations/`) → `pnpm run db:migrate` to apply it. Skip `db:push`.

### Recovering from a stale DB after a merge

If your local DB was bootstrapped via `db:push` before a teammate merged in new migration files (i.e. you missed running `db:push` after the pull), you'll see runtime errors like `column "X" does not exist` or `relation "Y" does not exist`. Recovery:

1. `pnpm exec drizzle-kit generate` — confirms `schema.ts` matches the snapshot files. If it emits new SQL, you have schema drift unrelated to the missed migration; investigate before continuing.
2. Apply each missing migration in order via the psql fallback above. ALTER TABLE statements should use `IF NOT EXISTS` patterns so they're safe to re-run; CREATE TABLE / CREATE INDEX already have `IF NOT EXISTS` from drizzle-kit's emitted SQL.
3. Register the applied migrations into `drizzle.__drizzle_migrations` by running `pnpm exec tsx scripts/bootstrap-drizzle-migrations.ts` (idempotent — skips entries whose hash already exists). This makes the DB look like `drizzle-kit migrate` was used end-to-end, so future migrate runs won't try to re-apply known migrations.

---

## 7. Invariants worth knowing

These rules are baked into the schema and the code that talks to it. Breaking one usually means a schema migration or a cross-cutting refactor.

- **Every table has `org_id`** (except `organizations` itself). Queries must filter on it. From a request handler, read `orgId` off the iron-session payload — never call the legacy script-only `getCurrentOrgId()` from `src/lib/auth.ts` (it's only for tsx maintenance scripts).
- **Embedding dim = 1024** everywhere — `vector(1024)` columns, ivfflat indexes, `EMBEDDING_DIMENSIONS` env, `embedBatch` slicing. Changing this requires a migration that drops + re-creates the embedding columns and indexes.
- **Vector indexes are ivfflat + cosine.** When adding a new embedding column, mirror the existing pattern (see `rag_module_entries` / `external_brain_chunks`).
- **Auth columns live on `team_members`.** `access_role` is `'manager' | 'employee'`; `password_hash` null = cannot sign in; `must_change_password` is a banner flag the Settings page enforces. Don't add a separate `users` table — single source of identity.
- **Onboarding bootstraps the first manager.** `/api/onboarding/commit` accepts `owner: {name, email, password ≥ 8}`, finds (or inserts) the matching `team_members` row, sets `access_role='manager'` + bcrypt hash, and writes the session cookie on the response. Demo seed assigns `access_role` by job-title keyword (head/lead/director/manager/ceo/cto → manager).
- **Reality-gap detection is pure rules.** `src/lib/signals/reality-gap.ts` does zero LLM calls. Don't "improve" it by adding one unless that's the explicit task.
- **`llm_usage` is best-effort logged.** `recordUsage()` is wrapped in try/catch inside the LLM wrappers (chatJson / chatStream / embed / embedBatch / vlmChatStream / vlmDescribeImage). A logging failure never breaks the underlying call. Adding a new call site = appending to `src/lib/llm-usage/call-sites.ts` (TS-enforced union).
- **Demo data is layered.** `db:seed` (org/members/projects/conversations) → `rag:sync` (70 RAG entries, hash-dedup safe) → `db:seed:signals` (30 days + drama + reality_gaps). `db:reset:full` runs all three in order.

---

## 8. Adding a new table

1. Add the `pgTable(...)` definition to `src/lib/db/schema.ts`. Mirror conventions: `id uuid pk`, `org_id uuid fk → organizations(id) onDelete: cascade`, `created_at timestamptz default now()`. Add indexes for foreign keys you'll filter on.
2. Run `pnpm run db:push` against your dev DB. (If it hangs, see §6.)
3. Create a repo file in `src/lib/db/repos/<tableCamelCase>.ts` exposing query helpers (start with `findAll(orgId)` / `findById(orgId, id)` and grow from there).
4. Update [`data.md`](./data.md) — add the column shape, an example row, and upstream/downstream notes. Reviewers look here first.
5. If the table needs demo data, decide which seed script owns it (`seed-demo-org.ts`, `sync-ai-modules.ts`, or `seed-signals-history.ts`) and extend that script — don't introduce a fourth seed entry point.
6. If the table holds embeddings, follow the `vector(1024)` + ivfflat pattern from `rag_module_entries`.

---

## 9. Troubleshooting (DB-specific)

For the full operational troubleshooting list (dev-server quirks, SSE pipe issues, RAG zero-hits, Windows quoting) see [`dev-commands.md`](./dev-commands.md) §4. The DB-only subset:

- **`vector` type does not exist** — `db:init` was skipped. Run `pnpm run db:push` (which chains it), not `drizzle-kit push` directly.
- **`db:push` hangs at "Pulling schema from database…"** — Windows TTY issue. For `db:reset` chains this no longer applies (we use `db:migrate` now). For ad-hoc schema iteration on Windows, see §6.
- **`DATABASE_URL is not configured`** — `.env.local` is missing or the line is commented. drizzle-kit and the tsx scripts both load it via `scripts/_env.ts` because drizzle-kit doesn't read it on its own.
- **`column "<x>" does not exist`** at runtime — `schema.ts` was edited (locally, or via a teammate's merge) but `db:push` wasn't run on your DB. Push, then restart the dev server. If you missed `db:push` after a merge that introduced versioned migrations, see "Recovering from a stale DB after a merge" in §6.
- **`db:push` reports it can't talk to the DB** — container still starting up. Either run `pnpm run db:wait` first, or use `pnpm run db:reset` (which sequences correctly).
- **`iron-session: SESSION_SECRET must be set to a string of at least 32 characters`** — the auth cookie is signed with `SESSION_SECRET`. Add it to `.env.local` (Node-dev) or `.env` (Docker app); ≥32 chars; generate via `openssl rand -base64 48`. Restart the dev server after editing.

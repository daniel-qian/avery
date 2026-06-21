# Brief — How reference agents do loop / memory / planning / tools (5-min read)

**For:** Danny · **From:** Eval architect · **Date:** 2026-06-21
**Purpose:** Briefing input for the HEADLESS Avery consultant-agent that exists only to generate evaluation data (batch-run frozen scenarios, compare Avery vs codex/claude). This sharpens the "Eval architect" section of [2026-06-20-coldstart-eval-roundtable.md](../2026-06-20-coldstart-eval-roundtable.md) — read that first; this does not re-derive it.

**The one-line takeaway:** every serious agent is the *same* skeleton — a `while` loop that does **think → tool-call → observe** until done, plus markdown/file memory and self-registering tools. The loop is a commodity we copy. Avery's value is **not** the loop; it's the *system prompt (relational operating model), the mandatory `cite()` step, and a hard red-line validator*. Nobody we benchmark against has those, which is exactly why the comparison is fair and the result is honest.

---

## The four reference agents, compared

| Agent | Loop | Memory | Planning | Tool interface |
|---|---|---|---|---|
| **Codex (OpenAI)** | Single iterative `think→tool-call→observe`; stateless requests; loops until done | **Compaction**: when tokens exceed a threshold, replace history with a smaller representative list (`type=compaction` item carrying encrypted latent context) | Emergent from the loop + prompt; long-horizon work leans on compaction, not an explicit planner | Model emits tool calls; CLI executes locally; prompt-caching makes cost linear not quadratic |
| **Claude Code / Agent SDK** | "The agent loop is a simple `while`-loop"; **only ~1.6% of the codebase is AI logic — 98.4% is deterministic infra** (permission gates, context mgmt, tool routing, recovery) | **4 layers**: `CLAUDE.md` (always-loaded source of truth) → auto-`MEMORY.md` (learned, first 200 lines/25KB load) → Memory Tool (on-demand) → subagent memory (per-agent dir) | Plan vs Build separation; subagents run in **fresh context and return only a summary** — a context-management primitive | Built-in file/shell/edit tools; tool allow/deny lists; MCP; self-evaluation closes the loop |
| **Hermes (Nous Research)** | `AIAgent` in `run_agent.py`: build system prompt → resolve provider → call → dispatch tool calls → loop → persist | **SQLite + FTS5 full-text search**; lineage tracking parent/child across compressions; per-platform isolation; atomic writes | **Tiered prompt** (stable→context→volatile): identity/tool-guidance/skills, then context files, then memory/profile/timestamp | `<tools>` JSON schemas in prompt; model emits `<tool_call>`; **central registry, 70+ tools self-register at import** |
| **opencode** | Full tool loop in a single-process harness; event-driven (not polling) | Sessions; no code/context retention (privacy-safe); LSP diagnostics fed back into context | **Plan agent** (read-only analysis) + **Build agent** (acts on the plan) — explicit two-mode planning | Any provider/model; LSP-as-tool; peer-to-peer multi-agent messaging |
| **openclaw** | Does **not** ship its own runtime — wraps the **Pi** agent loop; adds gateway/orchestration | **Persistent context in Markdown files** ("Memory" component) | "Brain" orchestrates via a **ReAct** reason→act loop | "Skills" = plug-in capabilities; "Lane Queue" serializes execution to avoid races; semantic snapshots for cheap web reads |

---

## What this means for Avery (the load-bearing observations)

1. **Copy the loop verbatim.** Codex, Claude Code, Hermes and openclaw all converge on `think→tool-call→observe` (ReAct). Our roundtable already specced ~150 lines of Python + Anthropic SDK; that's correct and unremarkable. Do not innovate here.

2. **Memory is markdown + keyword search, not a vector DB — at our scale.** Claude Code's top layer is a hand-written `CLAUDE.md`. openclaw stores memory in markdown files. Hermes only reaches for SQLite/FTS5 because it runs 70+ tools across many platforms. For a frozen eval set of 25–30 scenarios, **`facts.md` + `notes.md` + keyword recall** is the right altitude; defer the vector DB (matches the roundtable and the P7-03 recommendation).

3. **Planning can stay implicit — but Avery should be a *fixed chain*, not free-roaming.** Codex lets planning emerge; opencode makes it explicit (Plan→Build). Avery's "planning" is a **fixed consultant chain: read_case → recall → cite → draft_advice.** This is deliberately *less* agentic than a coding agent, and that's a feature: it makes every run auditable and makes `cite()` un-skippable.

4. **Tools self-register and are file/JSON-schema based everywhere.** Hermes' registry pattern and Claude Code's tool allowlists are the model. Avery needs only ~4 file-based tools — trivially copied.

5. **The honest differentiator = the things none of them have.** A coding agent's loop optimizes for *task completion*. Avery's loop must optimize for *grounded, humane judgment under a hard ethical constraint*. The three pieces that make Avery's loop ≠ a coding agent:
   - a **relational operating model** in the system prompt (advise the leader on a human situation; never rate the human),
   - **`cite()` mandatory before any advice** (no claim without evidence pointer),
   - a **hard red-line validator** that auto-fails any output scoring/diagnosing/judging a *person*.
   Codex and Claude, run on the same scenarios, **will** trip that validator — and that is the most credible single result in the whole eval (per Ray: "a believable loss beats an unbelievable win").

---

## Sources
- [OpenAI — Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/) · [ZenML — Codex CLI architecture & agent loop](https://www.zenml.io/llmops-database/building-production-ready-ai-agents-openai-codex-cli-architecture-and-agent-loop-design) · [Codex CLI context compaction](https://codex.danielvaughan.com/2026/03/31/codex-cli-context-compaction-architecture/)
- [Anthropic — Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) · [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents) · [Anthropic — Writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) · [Claude API — Using agent memory](https://platform.claude.com/docs/en/managed-agents/memory) · [Penligent — Inside Claude Code architecture](https://www.penligent.ai/hackinglabs/inside-claude-code-the-architecture-behind-tools-memory-hooks-and-mcp/)
- [Hermes Agent — Architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture) · [Hermes 3 Technical Report (arXiv)](https://arxiv.org/pdf/2408.11857)
- [opencode.ai](https://opencode.ai/) · [How coding agents actually work: inside OpenCode](https://cefboud.com/posts/coding-agents-internals-opencode-deepdive/)
- [OpenClaw architecture guide (Vertu)](https://vertu.com/ai-tools/openclaw-clawdbot-architecture-engineering-reliable-and-controllable-ai-agents) · [Lessons from OpenClaw's architecture (Agentailor)](https://blog.agentailor.com/posts/openclaw-architecture-lessons-for-agent-builders)
- [Self-Preference Bias in LLM-as-a-Judge (NeurIPS 2024)](https://arxiv.org/pdf/2410.21819)
</content>
</invoke>

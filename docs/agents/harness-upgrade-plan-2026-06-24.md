# Harness Upgrade Audit Plan - 2026-06-24

## Summary

Current harness tier is already strong minimal-plus: validator score `96/100`; bottleneck is `state`, specifically `session-handoff.md` not cleanly advertising blockers/files/next step to the validator.

Do not migrate this repo to the full OpenAI advanced template wholesale. Avery is still a demo/prototype repo, and `AGENTS.md` already routes to the project domain docs, ADRs, issue tracker docs, live feature state, and progress log.

Recommended upgrade: add only two lightweight full-tier reference pieces, plus one hook/git hygiene ticket before any hook rollout.

## Implementation Status

Implemented in this upgrade:

- HARN-01: `docs/agents/clean-state-checklist.md`.
- HARN-02: `docs/agents/evaluator-rubric.md`.
- HARN-03: `.gitignore` now ignores only local/bulky agent state while keeping hook/config paths trackable by default.
- HARN-04: `scripts/audit-hooks.mjs`.
- HARN-05: `scripts/agent-context-banner.mjs`.

Not implemented by design:

- No `.claude/settings.json` or `.codex/hooks.json` was added.
- No hook was activated.
- `scripts/agent-context-banner.mjs` is a soft, reusable script only; wire it later after Danny explicitly wants project-local hooks enabled/trusted.

## Evidence Checked

- `node "C:\Users\86139\.claude\skills\harness-creator\scripts\validate-harness.mjs" --target "D:\TeamMaster-Prototype-2.0"`: overall `96/100`.
- `bash ./init.sh`: `npm run typecheck` and `npm run build` passed.
- `git status --short --branch`: on `main`, ahead of `origin/main` by 9 commits; `.claude/` and `marketing/` are untracked.
- Hook config scan: no project `.codex/`; no `.claude/settings.json`; `.claude/settings.local.json` only contains local permissions, no hooks.
- Hook history scan: no history for `.codex/hooks.json`, `.claude/settings.json`, `.claude/hooks`, or `.codex/hooks`.
- `.claude/launch.json` has history: added in feat-010 and then removed from main as a worktree temporary file, but a local untracked copy currently exists.
- `.gitignore` does not blacklist `.claude/` or `.codex/`; global git ignore excludes `.claude/settings.local.json`.

## Minimal vs Full Tier Reading

Minimal tier components:

- `AGENTS.md` / `CLAUDE.md`: startup path, scope rules, done definition.
- `init.sh`: one command for baseline verification.
- `progress.md`: restartable session state.
- `feature_list.json`: machine-readable feature status, dependencies, evidence.
- Optional `session-handoff.md`: long-session handoff.

Full tier components worth knowing, but not all worth adding here:

- Short root `AGENTS.md` plus deeper docs under `docs/`.
- Product/design/reliability/security governance docs.
- Active/completed execution plans.
- Reference material folders for model-readable docs.
- Quality scorecards and SOPs.
- Clean-state checklist and evaluator rubric.

For this repo, the high-value additions are the checklist and rubric. The rest would be heavier than the current pain.

## Existing Harness Inventory

Present and useful:

- Root entrypoints: `AGENTS.md`, `CLAUDE.md`.
- Live state: `feature_list.json`, `progress.md`, `session-handoff.md`.
- Verification: `init.sh`, `npm run typecheck`, `npm run build`.
- Domain/project docs: `CONTEXT.md`, `docs/adr/*`, `docs/agents/*`.
- Roles: `roles.md`, plus local untracked `.claude/agents/*`.
- Issue handoff material: `.issues/`, `.to-issues/`.

Originally missing or intentionally absent:

- `docs/agents/clean-state-checklist.md` - now added.
- `docs/agents/evaluator-rubric.md` - now added.
- Project-local `.codex/hooks.json` - still absent by design.
- Project-local `.claude/settings.json` hook config - still absent by design.
- Hook scripts under `.codex/hooks/` or `.claude/hooks/` - still absent by design.

## Decisions

### Add: Clean State Checklist

Place under `docs/agents/clean-state-checklist.md`, not root. Add a short link from `AGENTS.md`.

Purpose:

- Make branch/worktree/session closure mechanical.
- Force agents to state current branch, upstream, worktree root, dirty files, untracked agent config, and whether they are allowed to touch root live-state docs.
- Catch wrong-branch commits and untracked hook/config assets before the next session.

### Add: Evaluator Rubric

Place under `docs/agents/evaluator-rubric.md`, not root. Add a short link from `AGENTS.md`.

Required six dimensions:

- Correctness.
- Verification.
- Scope discipline.
- Reliability / restartability.
- Maintainability.
- Handoff readiness.

Verification dimension must say: failure paths must be actually run when claimed; do not infer failure behavior from success-path reasoning.

### Add Before Hooks: Hook Liveness / Git Hygiene Ticket

Do not add hooks until this is done.

Purpose:

- If `.claude/settings.json` or `.codex/hooks.json` references a script, prove the script exists and has git history with `git log --all -- <exact path>`.
- Keep `.claude/` and `.codex/` trackable by default; ignore only local or bulky subpaths such as `.claude/settings.local.json`, `.claude/worktrees/`, caches, archives.
- Require hook scripts to tolerate representative, adversarial, bad JSON, and empty stdin inputs with safe `exit 0` behavior unless they intentionally block.

### Do Not Add Now

Reject for this project stage:

- Root `QUALITY_SCORE.md` or quality-score ledger.
- `docs/DESIGN.md`, `docs/RELIABILITY.md`, `docs/SECURITY.md` governance pack.
- `docs/exec-plans/active` / `completed` machinery.
- SOP library.
- Generated reference-material directory.
- Broad hook enforcement pack.

Reason: this repo is a demo prototype with strong ADR/domain routing already. More structure would mostly create maintenance load and stale docs.

## Hook Protocol Notes

Claude Code and Codex hooks are separate systems, but close enough that simple Node scripts can usually be shared.

Common useful assumptions:

- Tool hooks receive JSON on stdin.
- `PreToolUse` includes `tool_name` and `tool_input`.
- `tool_input.command` is the command-like field for Bash / shell and patch-style tools.
- Blocking uses `hookSpecificOutput` with event-specific fields.

Codex-specific constraints to respect:

- Project-local hooks require trust review before running.
- Codex supports `hooks.json` or inline `[hooks]` in `config.toml`.
- Windows commands can use `commandWindows`.
- Multiple matching command hooks may launch concurrently.
- `permissionDecision: "ask"` is not safe to rely on today; docs say it is parsed but unsupported and the tool call continues after hook failure.
- `PreToolUse` is a guardrail, not a complete security boundary.

## Ticket Split

### HARN-01 - Add Clean State Checklist

Scope:

- Create `docs/agents/clean-state-checklist.md`.
- Link it from `AGENTS.md` under startup/end-of-session rules.
- Include exact checks for branch, upstream, worktree root, dirty files, untracked `.claude` / `.codex`, active feature, verification evidence, and handoff state.

Acceptance:

- Checklist is short enough to run every session.
- It explicitly distinguishes main checkout from feature worktree behavior.
- It does not require creating new governance directories.

### HARN-02 - Add Agent Evaluator Rubric

Scope:

- Create `docs/agents/evaluator-rubric.md`.
- Link it from `AGENTS.md`.
- Define 0-2 scoring for the six dimensions.
- Add the hard verification rule: claimed failure paths must have been actually exercised.

Acceptance:

- Rubric can score a single agent session in under 10 minutes.
- It produces `Accept`, `Revise`, or `Block`.
- It has examples tuned to this repo: demo UI work, eval-harness work, docs/strategy work.

### HARN-03 - Normalize Agent Dir Git Hygiene

Scope:

- Update repo `.gitignore` to ignore local/bulky agent paths only.
- Suggested ignores: `.claude/settings.local.json`, `.claude/worktrees/`, `.claude/cache/`, `.codex/local/`, `.codex/cache/`.
- Do not ignore `.claude/settings.json`, `.claude/hooks/`, `.codex/hooks.json`, `.codex/config.toml`, or `.codex/hooks/`.
- Decide whether `.claude/agents/*` should be tracked project role assets or moved/ignored as local experimentation.

Acceptance:

- New hook configs/scripts cannot silently stay untracked because of a broad ignore.
- Existing local `.claude/launch.json` is either intentionally tracked or removed from working tree if still a temporary preview file.
- `git status --short` noise from local worktree artifacts is reduced.

### HARN-04 - Hook Liveness Audit Script

Scope:

- Add a small script that reads project `.claude/settings.json` and `.codex/hooks.json` if present.
- Extract command handlers that point into the repo.
- Verify target files exist.
- Run `git log --all -- <exact path>` for each target and report paths with no history.

Acceptance:

- No false failure when hook config files are absent.
- No false failure on empty stdin or malformed config; report and exit cleanly.
- Can be called manually from the clean-state checklist.

### HARN-05 - Soft Commit-Context Banner

Scope:

- Only after HARN-03 and HARN-04.
- Add a shared Node script usable by Claude and Codex `SessionStart` to print branch/upstream/worktree/dirty summary.
- Optionally wire `PreToolUse` for `git commit` to warn when committing on `main`, but do not hard block.

Acceptance:

- On this repo's current main-fast-lane workflow, the guard informs instead of fighting the workflow.
- The script exits 0 for non-git dirs, non-matching commands, empty stdin, and malformed JSON.
- If later changed to block, the decision must be explicit in the ticket and tested with piped JSON.

## Recommended Order

1. HARN-01.
2. HARN-02.
3. HARN-03.
4. HARN-04.
5. HARN-05 only if the previous two show hooks will stay live and tracked.

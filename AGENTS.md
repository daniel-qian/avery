# AGENTS.md

TeamMaster 2.0 —— 面向小公司 manager 的管理平台 **demo 原型**（Vite + React + framer-motion + zustand）。代码只服务 demo 叙事，不按产品工程标准要求（见 ADR-0001）；领域术语表在 `CONTEXT.md`，架构决策在 `docs/adr/`，动手前先读与所改区域相关的条目。

## Startup Workflow

Before writing code:

1. 读本文件。
2. 读 `feature_list.json` —— 当前各 feature 的状态、依赖、证据。
3. 读 `progress.md` —— 上个 session 停在哪、下一步是什么。
4. 跑 `./init.sh`（或手动 `npm run typecheck && npm run build`）确认起点是绿的。

首次环境：`npm install`；本地运行：`npm run dev`。

## Scope

- **One feature at a time**：只做 `feature_list.json` 里你认领的那一个 feature，依赖未完成的不要开。Stay in scope —— 顺手发现的问题记进 `progress.md` 的 Notes，不要顺手修。
- feature 状态只有三种：`not-started` / `in-progress` / `done`。改状态必须同步改 `evidence` 字段。

## Verification Commands

- `./init.sh` —— 一键跑全部检查（typecheck + build，fail fast）。
- `npm run typecheck` —— `tsc -b` 零错。
- `npm run build` —— typecheck + vite build。
- 没有自动化 test suite：行为验证靠 `npm run dev` 目测，验证了什么写进 evidence。

## Definition of Done

一个 feature 标 `done` only when：

1. `./init.sh` 通过，输出摘要记入 `feature_list.json` 的 `evidence`。
2. 行为经 `npm run dev` 目测确认（看了什么、结果如何，写进 evidence 或 `progress.md`）。
3. Venus-facing 的新英文 copy 就地标 `⚠ 待 Danny 审字`，不自行定稿。
4. `progress.md` 已更新。

## End of Session

Before ending（或 context 快用完时）：

1. 更新 `progress.md`：What's Done / In Progress / Next steps / Blockers / Files Modified。
2. 更新 `feature_list.json` 状态与 evidence。
3. 跨 session 的大块交接另写 `session-handoff.md`。
4. 目标：下个 session 不靠聊天记录、只靠这三个文件就能 restartable。

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues in `daniel-qian/TM2.0`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles, each mapped to a label string equal to its role name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

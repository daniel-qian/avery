# Session Progress Log

> 📢 **致下个 session：本仓库已 adopt harness 体系（2026-06-11）。**
> 启动路径见 `AGENTS.md` 的 Startup Workflow：读本文件 + `feature_list.json`，跑 `./init.sh` 确认绿，再开工。
> 旧的 wave 体系（`.to-issues/`、`.handoff/`）仍在仓库里作为历史档案，但**不再是状态来源**。

## Current State

**Last Updated:** 2026-06-11
**Active Feature:** none — 等 pitch 反馈进来后认领 feat-002

## Status

### What's Done

- [x] **feat-000 Demo Prototype — demo is ready。** P1–P6 全部 wave 完成（Dashboard calm/focus + pan-zoom 画布、Nexus 多 thread 编排 + follow-up + errand cases、rail 三幕、onboarding），已用于 pitch。此项完成于 adopt harness 之前，历史细节在 `.to-issues/archived/` 与 `docs/adr/`。
- [x] feat-001 Project Setup — `bash init.sh` 全绿（typecheck + build）
- [x] adopt harness 体系：`AGENTS.md` + `feature_list.json` + `progress.md` + `init.sh` + `session-handoff.md`

### What's In Progress

- （无）

### What's Next

1. **feat-002：根据 pitch 反馈打磨 demo** —— 等反馈进来，先把反馈拆成具体条目写进 `feature_list.json` 再开工
2. **feat-003：开始真功能开发**（demo-only 阶段结束，届时正式 supersede ADR-0001 的 demo-only 立场）

## Blockers / Risks

- feat-002 等待外部输入：pitch 反馈尚未收集成型

## Decisions Made

- **采用 harness-creator 最小规范**（2026-06-11）：状态只认 `feature_list.json` + `progress.md`；验证入口 `./init.sh`（typecheck + build，无测试套件，行为靠 `npm run dev` 目测）。
- **progress.md 整体覆盖、不追加**；done 的 feature 批次收口时归档。长期记忆走 `docs/adr/` 与 `CONTEXT.md`。

## Files Modified This Session

- `AGENTS.md` — 重写为标准五段（Startup Workflow / Scope / Verification Commands / Definition of Done / End of Session），保留 Agent skills 段
- `feature_list.json` — 新建；记入 feat-000（demo，done）、feat-001（setup，done）、feat-002/003（下一步）
- `progress.md`、`init.sh`、`session-handoff.md` — 新建

## Evidence of Completion

- [x] Type check clean: `npm run typecheck`（tsc -b 零错，经 init.sh）
- [x] Build: `npm run build`（vite ✓ built）
- [ ] Tests pass: 无测试套件
- [ ] Manual verification: 本 session 无行为改动，不适用

## Notes for Next Session

- 遗留 HITL：P6-08 审字（Danny）+ 换真 memo 照片，属旧 wave 体系收尾，不进 feature 列表。
- pitch 反馈进来后：先用 `/grill-with-docs` 或直接对话把反馈拆成 feature 条目（必要时拆成多个 feat），写进 `feature_list.json`，再认领开工。
- 已讨论但**刻意未写进 AGENTS.md** 的两条扩展规则（等真正需要时再追加，避免规则膨胀）：
  - 并行 feature：共享状态文件（feature_list.json / progress.md）只允许协调者单一 writer，worker 用 worktree 隔离、在自己分支/issue 里留进度；重叠 issue 先提成 contract slice 独占落 main（P6-01 模式）。
  - AFK 长任务：harness 不自动重试，靠"起点必须绿 + 每 issue 一 checkpoint + 重试≤2 次后落盘 blocker 并打 ready-for-human"控制爆炸半径；真自动化需外层 /schedule 或 /loop 调度。

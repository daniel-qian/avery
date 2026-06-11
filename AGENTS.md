# AGENT.md

TeamMaster 2.0 —— 面向小公司 manager 的管理平台 **demo 原型**（Vite + React + framer-motion + zustand）。代码只服务 demo 叙事，不按产品工程标准要求（见 ADR-0001）；领域术语表在 `CONTEXT.md`，架构决策在 `docs/adr/`，动手前先读与所改区域相关的条目。

## Startup

```
npm install    # 首次
npm run dev    # Vite dev server —— 没有测试套件，目测是唯一的行为验证手段
```

## Verification — definition of done

一个切片算"完成"必须同时满足：

1. `npm run build`（= `tsc -b` 零错 + vite build）通过 —— 硬门槛，提交前必须跑并确认零错。
2. 当前 wave README 的"铁律"全部满足（store 契约、CSS banner 区、ADR-0002 动效护栏、ADR-0006 replay-safe 等，以 wave README 为准）。
3. Venus-facing 的新英文 copy 就地标 `⚠ 待 Danny 审字`，不自行定稿。
4. commit message 用 `feat(p6-xx): …` 风格，注明对应 ADR / issue。

## State & scope

- 工作按 wave 组织在 `.to-issues/`：**当前 wave = 编号最大、未进 `archived/` 的 `P*-README.md`**，它是切片索引、依赖表与铁律的权威来源；完结 wave 整体移入 `.to-issues/archived/`。
- **一次只做一个 issue**，严格按依赖表的 Blocked by 顺序；标 **HITL** 的切片留给人裁断，AFK agent 不要代做。
- 完成一个切片后，在 wave README 表格的"状态"列打 ✅ 并附 commit 短 hash。
- bug / PRD 走 GitHub issues（见下方 Issue tracker）。

## Session lifecycle

- 跨 session 交接材料在 `.handoff/`。长 session 结束前用 `/handoff` 或手写一份，包含：已完成项 + 证据（build 输出 / 截图）、未决 blocker、下一步、改动文件清单。
- 冷启动 / 重启路径：当前 wave README → `.handoff/` 里最新交接文档 → `git log --oneline -15`。

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues in `daniel-qian/TM2.0`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles, each mapped to a label string equal to its role name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

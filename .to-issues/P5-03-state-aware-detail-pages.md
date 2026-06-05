# P5-03 · #5 state-aware 详情页（believed / grown phase）

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

详情页从「静态恒显」改为 **state-aware（智能层随 thread 生长）**，supersede [ADR-0005](../docs/adr/0005-detail-pages-static-reveal-protected-by-beat-order.md)。依据 [ADR-0009](../docs/adr/0009-state-aware-detail-pages-supersedes-0005.md)。

`EmployeeDetailScene` + `ProjectDetailScene` 读 `thread.steps` 派生一个 phase：

- **believed 态**（Nexus 前 / `thread.steps` 空）：只显原始事实——员工页 overview（workload / status / tasks）；项目页 brief / team / task board。**智能层模块走已有空态、不渲染**：HR knowledge analysis、weekly summary 解读、re-baselined milestones、handoffs、Risk & HR signal 子层、Evidence。→ 零剧透。
- **grown 态**（Nexus 跑过相关步后）：智能层**全长出** + warning 状态翻转为「已诊断 + 已派活」（**非字面变绿**；对齐 demo-brief B10：Acme 仍 at-risk 但有原因有 task 在途）。

数据 helper（`hrAnalysisFor` / `weeklySummaryFor` / `projectMilestones` / `handoffsForProject` / `signalsFor` / `signalsForProject`）接 phase 参数，或在 scene 层按 phase gate 模块。

**守约**：只读 `thread.steps` 派生（与 NexusScene 同套），**不扩 store**；`seek` 倒带后 believed/grown 由当下 steps 正确派生，replay-safe。

## Acceptance criteria

- [ ] believed 态（free-click 未跑 Nexus 即进）**零剧透**：Bill 页不显 `interrupt load, not performance` 根因 / weekly interrupt 证据；Acme 页不显 re-baselined milestones / handoffs / risk 子层。
- [ ] grown 态（Nexus 跑完后进）智能层全显 + warning = 「已诊断 + 已派活、周五保住」。
- [ ] believed 态是**连贯的 raw-facts 视图**，非半空 / 报错。
- [ ] 不扩 `canvasStore`（仅读 `thread.steps`）；replay-safe。
- [ ] `npm run build` 过。

## Blocked by

None — 可立即开始（P5-04 依赖本片）。

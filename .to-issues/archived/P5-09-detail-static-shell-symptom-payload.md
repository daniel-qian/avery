# P5-09 · detail pages static shell + symptom payload

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

把详情页从「believed 态隐藏整模块」改成 **static shell + content grows**：模块外壳恒显，内容深度随 `thread.steps` 从症状层长到诊断层。依据 [ADR-0011](../docs/adr/0011-detail-pages-static-shell-content-grows-amends-0009.md)，amend [ADR-0009](../docs/adr/0009-state-aware-detail-pages-supersedes-0005.md)。

Act1 / believed 态必须能教 Venus 现状：Acme at-risk、原始未重排 Connector 计划带 stall、Bill overloaded + interrupt 原始证据、Jason 有余量、以及「自报 on-track vs signals at-risk」并陈。Act1 不含 agent 诊断、Capabilities 建议、handoffs、re-baselined milestones、"not performance" 这类根因解读。

Act3 / grown 态才显示 Reality gap 解读、Capabilities 支撑的 recommendations、handoffs、重排 milestones。warning 文案取「已诊断 + actions in flight，仍 at-risk」而不是恢复正常；建议状态文案：`at risk · diagnosed · actions in flight · Friday held`。⚠ Venus-facing 新英文 copy 就地标 `⚠ 待 Danny 审字`。

实现上，`fixtures.p3` 里每个原先 `isBelieved -> null/[]` 的 helper 改返回 believed 症状 payload；项目页新增 Acme 原始 / stalled milestone 集，grown 仍返回现有重排集。`EmployeeDetailScene` / `ProjectDetailScene` 去掉 `isGrown ? ... : null` 的整模块包裹，改 per-module 内容派生。phase 仍只读 `thread.steps` 派生，不扩 `canvasStore`。

## Acceptance criteria

- [ ] Nexus 前 free-click 进 Acme / Bill 详情页时，相关模块外壳恒显且内容是连贯症状视图，不再是大面积空态。
- [ ] Act1 主列 headline 级可读出问题：status / stalled / overloaded；不能依赖 hover 才知道有问题。
- [ ] believed 态不剧透 agent 诊断：不显示根因解读、Capabilities 建议、handoffs、re-baselined milestones、"not performance" 结论。
- [ ] Nexus 后 grown 态显示诊断内容、handoffs、重排 milestones，warning 表达为 diagnosed + actions in flight，仍保留 at-risk 语义。
- [ ] phase 只读 `thread.steps` 派生；`seek` 倒带后 believed/grown 自洽，无闪烁。
- [ ] 不扩 `canvasStore`；`npm run build` 过。

## Blocked by

None — 可立即开始。

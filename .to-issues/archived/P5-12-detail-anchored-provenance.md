# P5-12 · detail anchored provenance

类型：**AFK** · Blocked by：**P5-09**

## What to build

把详情页 evidence / source 从底部堆叠改成 **anchored provenance**：source affordance 贴在它支撑的 claim 旁边，hover / click 揭示背后的 signal。依据 [ADR-0011](../docs/adr/0011-detail-pages-static-shell-content-grows-amends-0009.md)。

Project detail 拆掉底部 `detail-sublayer` 的 Risk & HR signal + Evidence 堆叠；每条关键 claim 自带 source affordance。两种 phase 都适用：believed 态的 signal 支撑「问题症状」陈述，grown 态的 signal 支撑「诊断 / recommendation」。Act1 的问题本身必须在主列 headline 可读，anchor 只用于展开更细 provenance。

同模式应用到 Employee detail：不要把 evidence 埋在 HR analysis 的 "signals considered" 里；Bill 的 overloaded / interrupt / no personnel judgment 等 claim 应能贴近 source 查看。必要时调整 `fixtures.p3` 的 signal-to-claim 关联 shape，但保持数据为 fixture 派生，不扩 `canvasStore`。

## Acceptance criteria

- [x] Project detail 不再依赖底部 evidence 堆叠来解释 claim；关键 claim 旁有 source affordance。
- [x] Employee detail 使用同一 anchored provenance 模式，Bill 相关 claim 能追到支撑 signal。
- [x] believed 态 anchors 支撑症状陈述；grown 态 anchors 支撑诊断 / recommendations。
- [x] Act1 问题仍在主列 headline 级可读，hover / click 只揭示 granular source。
- [x] source affordance 是次级视觉层级；进出场只用 `opacity` / `transform`，支持 `prefers-reduced-motion`。
- [x] 不扩 `canvasStore`；`npm run build` 过。

## Blocked by

P5-09（需要 static shell + symptom/grown 内容模型先就位）。

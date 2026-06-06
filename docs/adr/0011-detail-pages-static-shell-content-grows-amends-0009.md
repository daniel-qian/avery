---
status: accepted（amends ADR-0009：反剧透目标保留，隐藏机制反转）
---

# 详情页 believed/grown 改为「模块恒显、内容随 thread 生长」——amend ADR-0009 的「隐藏整模块」机制

## 背景

P5-04 落地后 Danny 在 demo 实跑（rail 3/13 · 2/3、3/3）发现：Act1 drill 进 Bill / Acme 的 believed 详情页**几乎是空的**——ADR-0009 用「整个智能层模块走空态、不渲染」来防剧透，结果钻进去看不到东西，**教不了 Venus 现状**（"Acme / Bill 失控、Jason 有余量"无从得知）。且 Act3 只 re-drill Acme，**Bill 的弧没闭**。

grill 厘清：ADR-0009 的**反剧透目标对**，但**「隐藏整模块」这个机制错**——它把"问题症状"和"agent 诊断"一起藏了。真正会剧透 Nexus killer beat 的只是**诊断**（根因解读 + Capabilities 建议 + 重排计划），不是"问题存在"本身。佐证：Dashboard B1 早已挂出 hot-spot pill `"Connector signals disagree with Monday status"`，"有问题"在进 Nexus 前**本就是公开的**。

## 决策

believed/grown 轴从**「模块显隐」**改为**「同一恒显模块的内容深度切换」（症状 ↔ 诊断）**。模块外壳恒显，内容随 `thread.steps` 生长。

**症状 / 诊断边界（用 glossary 术语锁死）：**

- **Act1 = 症状层** = 原始 `signals` + `believed state`。含：Acme at-risk、**原始（未重排）Connector 计划带 stall**、Bill 超载 + interrupt 原始证据、Jason 有余量、以及"自报 on-track vs 信号 at-risk"的**并陈**（与 B1 dashboard pill 一致）。**不含**任何 agent 解读。
- **Act3 = 诊断层** = 检测出的 `Reality gap` 解读（"interrupt load, not performance"）+ `Capabilities` 支撑的 recommendations + `Handoffs` + 重排 milestones。

**Act3 镜像 Act1 的 drill 顺序**：drill Acme（项目页：重排计划 + handoffs 落地 = **交付保住**）→ drill Bill（员工页：HR analysis + "no personnel judgment" = **护人**）。两条弧都闭。

**"警告解除"取「已诊断 + 在途、仍 at-risk」**，不显"恢复正常 / 变绿"：守 `Reality gap` glossary 定义（系统"只指出矛盾并给低风险下一步"、**不 fix**）+ demo-brief B10（Acme 在 V2 仍 at-risk，有原因 + task 在途）。grown 状态文案 = `at risk · diagnosed · actions in flight · Friday held`。

## 被否的替代

- **保持 ADR-0009 隐藏模块、只把空态当 polish 美化**：否——治标不治本，Act1 仍教不了现状。
- **全 static 恒显（revert ADR-0005，含诊断）**：否——Act1 钻入直接剧透 Nexus killer beat（Venus 在 agent "发现"前就把答案读走）。

## 后果

- **amend ADR-0009**：反剧透目标保留；机制 `隐藏整模块` → `模块恒显 + 内容随 thread 生长（症状→诊断）`。ADR-0005 仍被 supersede（不回退到静态恒显含诊断）。
- `src/data/fixtures.p3.ts`：每个 `isBelieved → null/[]` 的 helper 改返回 **believed 症状 payload**（而非空）；新增 Acme **原始 / stalled milestone 集**（believed），grown 仍返回 `TIMELINE` 重排集。⚠ believed payload 须**清掉解读性措辞**（如 weekly summary 的 "not from lack of effort" 属诊断 → 移到 grown），逐句 ⚠ 待 Danny 审字。
- `EmployeeDetailScene` / `ProjectDetailScene`：去掉 `isGrown ? … : null` 的**整模块包裹**，改 **per-module 内容派生**（壳常驻、内容按 phase）。
- `src/store/railStore.ts`：B9b 在 Acme drill 后**加一步 Bill re-drill**（镜像 Act1；落地段 drill-in 合 ADR-0007；幂等 + replay-safe 合 ADR-0006）。
- **replay-safe 不变**：phase 仍只读 `thread.steps` 派生，`seek` 倒带后自洽。
- **不扩 `canvasStore`**（守 P5 铁律）；glossary 无需新词（既有 `signals` / `believed state` / `Reality gap` / `Capabilities` / `Handoff` 已表达此边界 = 模型贴合领域语言的信号）。
- **evidence / source 改 anchored provenance**（grill 2026-06-06，point ③）：拆掉 `ProjectDetailScene` 底部的 `detail-sublayer`（Risk & HR signal + Evidence 堆叠），改为**每条 claim 贴 source affordance**（hover/click 揭示其背后的 signal）——provenance 紧贴它支撑的判断（"这条建议 ← 这条信号"）。两 phase 通用：Act1 signal 支撑「问题」陈述、Act3 signal 支撑「诊断」。⚠ Act1 的问题须**主列 headline 级可读**（status / stalled / overloaded），granular signal 才走 anchor 按需展开（demo 不能靠 hover 才看见问题）。建议同模式应用到 `EmployeeDetailScene`（现 evidence 埋在 HR analysis 的 "signals considered" 内）以保持一致。次级字体；进出场守 ADR-0002（只 opacity / transform）。可按需提升为独立 ADR。

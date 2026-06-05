---
status: accepted（supersedes ADR-0005）
---

# 详情页改为 state-aware「智能层随 thread 生长」，supersede ADR-0005 的静态恒显模型

## 背景

Danny 要三幕叙事（#5）：Nexus 前 drill 员工 / 项目详情页**看现状** → 飞进 Nexus **解决** → 解决后**警告解除**。但详情页现状是 ADR-0005 的"静态恒显全部模块、零 thread 耦合"：

- Bill 员工页 `HR_ANALYSIS.u_bill` **逐字印着 B6 根因**（"Reduced Connector output lines up with interrupt load, not performance… a routing problem, not a capability one"）；weekly summary 印着 interrupt 证据。
- Acme 项目页 milestones 直接是 `TIMELINE.milestones`（= **re-baselined 后**的 B8 产出），handoffs 是 B9 建议。

故 Nexus 前 drill = 把谜底先摊给 Venus，正是 ADR-0005 当初取消 B2 drill 要防的剧透。

**关键观察**：Danny 的"看现状 → 解决 → 警告解除"在机制上**等同于 state-gating**——"不剧透"与"警告能解除"是同一个开关（页面反映 thread 进展）。而 state-gating 正是 **ADR-0005 考虑过又否决**的方案（否因 Danny 当时要"任何时候点开都完整可读"）。本决策即**反转那次否决**。

## 决策

详情页读 `thread.steps`（只读派生，**不扩 store**，与 NexusScene 同套）派生 phase：

- **believed 态**（Nexus 前 / steps 空）：只显原始事实（workload / tasks / brief / team / board）；智能层模块（HR analysis、weekly 解读、re-baselined milestones、handoffs、risk 子层）走**已有空态**、不渲染 → 零剧透。
- **grown 态**（Nexus 后）：智能层长出 + warning 状态翻转。

Act1 = 恢复 Nexus 前 drill（Bill + Acme，believed 态）；Act3 = B9b 复 drill（grown 态 = 警告解除）。"**警告解除**"取 **"从未诊断告警 → 已诊断 + 已派活、周五保住"**（非字面变绿，对齐 demo-brief B10：Acme 仍 at-risk 但有原因有 task 在途）。

## 后果

- **supersede ADR-0005**（标记其 status）——剧透保护从"靠 beat 顺序纪律兜底"升级为"机制上 state-gating，点早了也看不到答案"。
- P3 `EmployeeDetailScene` + `ProjectDetailScene` 改 phase-aware；数据 helper 接 phase 参数。
- **交还** ADR-0005 当初要的"任何时候点开都完整"——free-click 没跑 Nexus 即看 believed 态（缓解：believed 是连贯的 raw-facts 视图、非半空；before/after 对比反而让 agent 价值更可读）。
- rail 前戏段新增 Act1 drill beats（Bill + Acme），B9b 成为 Act3 落点。replay-safe（ADR-0006）。

# P3-02 · Project 详情页（静态全模块）+ task board + handoffs

类型：**AFK** · Blocked by：**P3-01**（复用 DetailShell + 派生 helper）

## What to build

把 `ProjectDetailScene` 从 P0 stub 做成**静态恒显**完整项目页（ADR-0005）。是 demo B9b（agent 派 task 后 drill 回 Acme，看 handoffs 落地）的页面；B2 已不再 drill 项目页（focus-only）。

模块——**主层级**：
1. **Project brief**：`title / summary / status / progress / dueDate / dependsOn`。
2. **Delivery milestones**：画 ≥5 阶段，靠颜色/标签/箭头表达 state。Acme **直接渲染既有 `TIMELINE.milestones`**（已含 6 阶段、带 `planned/replanned/held/deferred/conditional`）；Connector 用 `fixtures.p3.ts` 草拟的 ≥5 阶段；其余项目无数据 → 该模块空态。
3. **Team responsibilities**：owner + task assignees 派生的 avatar 集合。
4. **Task board**：当前 project 的 tasks 分 3 段渲染，从 `Task.status` 映射——`stalled`→**Needs decision** · `in-progress`→**In progress** · `done`+`todo`→**Done or waiting**。
5. **Handoffs**：agent 生成的可直接执行行动，checklist（done / discard）。部分项可一键飞回 Nexus = 调 `askQuestion(...)`（如「让法律 agent 深入研究 X」→ 飞 Nexus）。文本 `fixtures.p3.ts` 草拟。
6. **Weekly team updates**：本周成员进展，`fixtures.p3.ts` 草拟。

**次层级**（下沉，护 reveal）：`Risk & HR signal`（bullet，过滤 `SIGNALS`）· `Evidence`（source traces，bullet，`SIGNALS` 的 source+summary）。

**故事项目**（Acme / Connector）全模块；**texture 项目** 走 brief + team + task board 派生数据，缺数据模块空态。复用 P3-01 的 `DetailShell`。英文 copy 标 `⚠ 待 Danny 审字`（P3-05 收口）。

## Acceptance criteria

- [ ] `fixtures.p3.ts` 新增：Connector milestones（≥5）· `HANDOFFS`（按 projectId）· `WEEKLY_UPDATES`（按 projectId），additive。
- [ ] Acme delivery milestones 渲染 `TIMELINE.milestones`，state 以颜色/标签区分（held / conditional / deferred 视觉可辨）。
- [ ] Task board 三段映射正确：drill Acme 时 `Hook up Connector to Acme`(stalled) 落在 **Needs decision**。
- [ ] Handoffs checklist 可 done / discard（本地交互即可）；至少一条「飞 Nexus」项调 `askQuestion` 并切到 nexus scene。
- [ ] 次层级 risk/evidence 在主层级**下方**（不抢 B9b 之前的注意力）。
- [ ] drill 一个 texture 项目（如 Design System）：brief + team + task board 正常，milestones/handoffs/weekly/risk/evidence 走空态，不报错。
- [ ] 不 import/读取 `thread`；不扩 store。`npm run build` 过。

## Blocked by

- P3-01（共享 `DetailShell` 与派生 helper）

# P3-01 · Employee 详情页（静态全模块）+ 共享 DetailShell

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

把 `EmployeeDetailScene` 从 P0 stub 做成**静态恒显**的完整员工页（ADR-0005：零 `thread.steps` 耦合，任何时刻 drill 进去都是完整内容）。这是 demo B6（Nexus reveal 后 drill Bill）的落地页。

本切片同时**建立两块后续切片复用的基础设施**：
- 一个共享 `DetailShell`（`← Back` 走 `back()` action、统一的 section 布局/标题/eyebrow），P3-02 项目页复用。
- `fixtures.p3.ts` 里的**派生 helper**：`deriveStatus(capacityPct)`、`ownedProjectProgress(personId)`、`STORY_PEOPLE` 集合、`signalsFor(personId)`、空态判定。

模块自上而下：
1. **概览卡**：`Workload`=`capacityPct` · `Status`（派生：>110 `Overloaded` / 85–110 `Steady` / <75 `Has capacity`）· `Progress`=此人**所拥有项目**的 progress（Bill→Connector 48% / Vanessa→Acme 72% / Jason→Billing 30%）· `HR signal`=`fixtures.p3.ts` 草拟文本。
2. **Current project tasks**：`TASKS` by assignee，卡片含 project + status。
3. **Weekly summary + sentiment**：一段文字（`fixtures.p3.ts` 草拟）。
4. **HR knowledge analysis**：agent 据 HR capability 生成的建议（`fixtures.p3.ts` 草拟；口径守 *no personnel judgment*）。

**故事人**（Bill / Jason / Vanessa）四模块全有；**texture 人** 走派生数据（卡片 + tasks）+ 缺数据模块显示干净空态（如 `No HR signal — looks steady`），不渲染占位灰条。

英文 copy 先用我的初稿，标 `⚠ 待 Danny 审字`（P3-05 收口）。

## Acceptance criteria

- [ ] `fixtures.p3.ts` 新建：`HR_ANALYSIS` / weekly summary+sentiment / `Person` HR-signal 文本（按 id 索引），additive，不改共享 `fixtures.ts`。
- [ ] 派生 helper（status / owned-project progress / story-people / signalsFor）落地、零新 store state。
- [ ] 共享 `DetailShell` 落地，`← Back` 调 `back()`。
- [ ] drill Bill：卡显 `Overloaded · 134% · Progress 48% · Needs manager check-in`，含 tasks + summary + HR analysis 四模块。
- [ ] drill 一个 texture 人（如 Cecily）：显派生卡 + tasks，缺数据模块走空态，不报错、不显占位灰条。
- [ ] 详情 scene 不 import/读取 `thread`。
- [ ] `npm run build` 过（`tsc -b` 零错 + vite）。

## Blocked by

None — 可立即开始。

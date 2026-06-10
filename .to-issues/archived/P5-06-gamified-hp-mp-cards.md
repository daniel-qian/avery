# P5-06 · #2 HP/MP 卡 + mood fixture（占位 avatar）

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

calm 人卡渲染**游戏化 HP/MP HUD**（[ADR-0010](../docs/adr/0010-calm-cards-gamified-hp-mp-hud.md)）。本片先用**占位 avatar** 跑通逻辑，~15 个像素 sprite 资产交 P5-08 替换。

- 新增 **`mood` fixture**（~15 人，含 texture 人；现仅故事人有 sentiment）。
- 卡片渲染：
  - **HP = headroom（= 100 − `capacityPct`）**，越满越好，**临界 = 告警（泛红）**。修正反直觉：Bill 134% load → headroom 见底 → HP 危。HP 临界态**取代** `personTone` 的 `capacityPct >= 120` 橙色规则。
  - **MP = mood**（读新 `mood` fixture）。
  - avatar 暂用现有 initials 占位（像素 sprite 在 P5-08 替换）。
- **护栏：游戏化只在卡片层，地图层守 calm**——HP/MP 平时安静（健康者条满 / 中性、不抢眼），只有掉血 / 低 MP 的人跳出来 = 「2 秒读懂全员状态」。**scope 仅 calm 卡片**，详情页 / Nexus 不动。
- CSS 进 `global.css` 的 `/* P1 · Dashboard */` banner。**不碰 store**。

## Acceptance criteria

- [ ] 每张 calm 人卡显 HP（=headroom）+ MP（=mood）；Bill（134% load）HP 临界泛红 + MP 低 = 一眼最危险。
- [ ] HP 语义正确（headroom 满=好、临界=告警）；`personTone` 橙规则被 HP-派生 tone 取代。
- [ ] 地图层仍 calm（低密度、健康者不抢眼，无街机感）。
- [ ] `mood` fixture 覆盖全部 ~15 人。
- [ ] 不碰 `canvasStore`；`npm run build` 过。

## Blocked by

None — 可立即开始。**注意与 P5-05 同改 `DashboardScene.tsx`**。像素资产替换见 P5-08。

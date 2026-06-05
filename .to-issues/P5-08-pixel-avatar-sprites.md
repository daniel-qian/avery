# P5-08 · #2 像素 avatar sprite 资产（替换占位）

类型：**HITL**（需 Danny 美术方向）· Blocked by：**P5-06**

## What to build

为 calm 卡的 HP/MP HUD 提供 **~15 个像素 avatar sprite**，替换 P5-06 的 initials 占位（[ADR-0010](../docs/adr/0010-calm-cards-gamified-hp-mp-hud.md) 的游戏化方向）。

- ~15 个像素 sprite（故事人 Bill / Jason / Vanessa / Wang / 你 + ~10 texture 人），**美术方向由 Danny 定 / 提供**。
- 接入 P5-06 的卡片渲染，替换 initials 占位。
- 资产走静态引入；CSS / sizing 守像素清晰（`image-rendering: pixelated`），与 HP/MP HUD 视觉协调。

## Acceptance criteria

- [ ] ~15 人各有像素 avatar，卡片显示清晰（无糊、无缩放失真）。
- [ ] 与 HP/MP HUD 视觉协调；地图层仍守 calm（无街机感）。
- [ ] `npm run build` 过。

## Blocked by

P5-06（HP/MP 卡渲染就位后替换占位 avatar）。
**HITL**：Danny 提供 / 审定像素美术方向。

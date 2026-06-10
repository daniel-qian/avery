# P4-02 · DemoControls 呈现：低调进度胶囊 + free-click 提示 + 隐藏

类型：**AFK** · Blocked by：**P4-01**

## What to build

在 P4-01 已能驱动的引擎之上，把 `DemoControls` 的**最小 caption 升级成 Venus 面前不露怯的呈现层**（Q11）。场景：Danny 键盘驱动、可能投屏，控件就在 Venus 看得见的屏上——必须读着像**演示者辅助**，不像 debug 面板。

构成：
1. **底部居中低调进度胶囊**：`<beat label> · n / 12`（用人话 label，**不**显 `B5` 这种黑话）；多步 beat 追加子计数 `· k/3`（如 `Capabilities moat · 5 / 12 · 2/3`）。label / 子计数从 `SCRIPT[index]` 派生。
2. **free-click 提示**：B2 / B9 这两个〔自由交互〕beat，胶囊轻量标 `→ your turn · free-click`（提示 Danny 此处可松手现场点）。
3. **隐藏**：`H` 触发的 `hidden` 态 → 胶囊整体消失（纯 free-click 时刻）；键盘仍可用，任一 `seek` 重新显示胶囊。
4. 视觉沿用其余 scene 的 ambient 语汇（低对比、克制），CSS 进 `global.css` 的 `/* P4 · Rail / Capabilities mgmt */` banner。

> 键盘绑定本身已在 P4-01；本片只做胶囊的视觉 + 派生文案 + 隐藏态呈现。

## Acceptance criteria

- [x] 胶囊显示人话 beat label + `n / 12`（beat 序数），多步 beat（B4/B6）显子计数 `· k/3`。
- [x] B2 / B9 显 `your turn · free-click` 提示，其余 beat 不显。
- [x] `H` 隐藏胶囊；隐藏时键盘仍驱动；下一次 `seek` 后胶囊回来。
- [x] 读着像演示者辅助，非 dev 面板（低调、贴 ambient 语汇）。
- [x] 不扩 store；CSS 只追加 P4 banner；`npm run build` 过。

## Blocked by

- P4-01（需要可用的 `useRail` / `SCRIPT` / `index`）。

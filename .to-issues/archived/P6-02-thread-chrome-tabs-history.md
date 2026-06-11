# P6-02 · thread chrome：Nexus HUD tab strip + history popover

类型：**AFK** · Blocked by：**P6-01**

## What to build

ADR-0013 决策 6：混合 thread chrome——"chrome tab controls + Claude/GPT chat history list"。**只在 Nexus HUD**（Dashboard 是观察面，零改动）。

- **tab strip**（Nexus HUD 顶部）：列出 `isOpen` 的 thread，每个 tab = case 短名 + ×（调 `closeThread`）；active thread 高亮；点 tab = `openThread(caseId)` 切换。
- **history popover**：一个小 HUD 控件展开列出**所有** thread（含已关闭，按时序）；点击条目 = `openThread` 重开，**状态完整恢复**（steps、Manifest 列、context % 全在——store 里本来就没丢）。
- 不预置装饰性假历史：列表只显示真实存在的 thread。
- 关闭 active thread 的行为：切到剩余 open thread 之一；全关则显示 Nexus 空态（composer 待命）。
- 全部经核心 action（`openThread` / `closeThread`），free-click 可达、rail 可脚本（P6-07 用）。

## Acceptance criteria

- [ ] 单 case 即可演示完整 close→reopen 回环：关 bill/acme → tab 消失 → history 重开 → Manifest 列与步骤一根不少地回来。
- [ ] × 只翻 `isOpen`，不触碰 thread 数据。
- [ ] tab strip / popover 是 viewport-fixed HUD（守 ADR-0012 world/HUD 分层），不进画板。
- [ ] Dashboard 零改动。
- [ ] replay-safe：`seek` 重放含 open/close 的序列后 chrome 状态自洽。
- [ ] 新 CSS 只追加 `global.css` `/* P6 */` banner；`npm run build` 过。

## Blocked by

[P6-01](./P6-01-contract-pass-multithread-case-shape.md)。**与 P6-03 / P6-04 同改 `NexusScene.tsx` HUD 区**——建议串行或留意 merge。

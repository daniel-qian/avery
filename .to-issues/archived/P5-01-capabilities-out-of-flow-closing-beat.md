# P5-01 · #3 Capabilities 移出思考流 + 独立收尾 beat

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

把 Capabilities 从 Nexus 思考流中段（现 B4 的整页 drill）摘除，改成 demo 的**独立收尾 beat（13/13）**。依据 [ADR-0007](../docs/adr/0007-nexus-flow-uninterrupted-capabilities-closing-beat.md) 的三段划分：思考流（B4–B9）零整页 drill-in。

- 删 `railStore` SCRIPT 中 B4 的两步：`Capabilities reference opens`（`goScene('capabilities')`）+ 其后 `Return to Nexus`（`goScene('nexus')`）。B4 只剩单步 `runAgent()`。
- 删 `NexusScene.tsx` 里 pm-agent inspector 的 `Open Capabilities reference →` 按钮（它是流中途的 drill 触发器）。
- 新增收尾 beat：B10 之后加一步 `goScene('capabilities')`（label 如 `Capabilities — the moat`），成为 13/13 = 护城河 + 订阅营收的投资人收束论证。
- Topbar 的 Capabilities tab **保留**（free-click 仍可达）。

## Acceptance criteria

- [ ] 思考流 B4–B9 全程不离开 Nexus 场景（无整页 drill）。
- [ ] rail 末尾新增 Capabilities beat，键盘可走到 13/13 并落 Capabilities 页。
- [ ] pm-agent inspector 不再有 Capabilities 链接。
- [ ] free-click litmus：Topbar tab 仍能进 Capabilities。
- [ ] `seek` 到 13/13 replay-safe（先 replay 完 B10 的 `regenBriefing`+`goScene('dashboard')`，再 `goScene('capabilities')`）。
- [ ] 不扩 `canvasStore`；`npm run build` 过。

## Blocked by

None — 可立即开始。**注意与 P5-04 同改 `railStore` SCRIPT**，串行或留意 merge。

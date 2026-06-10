# P4 rail — build issues（本地，未发 GitHub）

> 注：`.to-issues/README.md` 属 P2(Nexus)、`P3-*` 属 P3(详情)。P4 的索引在本文件，issue 文件以 `P4-` 前缀命名，避开冲突。

来源：2026-06-05 `/grill-with-docs` 会话锁定的 P4 规格。
权威 doc：[BUILD-HANDOFF §5.2](../.handoff/BUILD-HANDOFF.md)（完整 SCRIPT 表）· [ADR-0006](../docs/adr/0006-rail-driver-is-stateless-replay-to-target-over-frozen-store.md)（replay-to-target driver）· [ADR-0003](../docs/adr/0003-demo-rail-is-detachable-driver-over-free-click-core.md)（rail 可拆）· [demo-brief](../docs/20260603-design/demo-brief.md) beat sheet。

## 铁律（每个 issue 都适用）

- **不扩冻结的 `canvasStore`**：rail 状态住**独立 `useRail` store**；只调已锁 action（`goScene / setFocus / openDetail / back / askQuestion / runAgent / dispatchTask / regenBriefing`）。
- **零 `if(demoMode)` 分支**（ADR-0003 litmus：每个 beat 自由点击仍可复现）。
- **replay-safe**：SCRIPT 每步幂等 / append-顺序确定；`seek` = `setState(INITIAL,true)` 倒带 + 同步 replay `0..target`（ADR-0006）。
- 删 rail = 删 `railStore` + `DemoControls` + `SCRIPT` + 撤一行挂载，**零行为损失**。
- CSS 追加到 `global.css` 尾部 `/* P4 · Rail / Capabilities mgmt */` banner，不动共享基座。
- `npm run build`（`tsc -b` 零错 + vite）必须保持过。

## 切片与依赖

| # | 切片 | 类型 | Blocked by |
|---|---|---|---|
| [P4-01](./P4-01-rail-spine.md) | rail spine：replay-to-target 引擎 + 完整 16-step SCRIPT + 键盘驱动 | AFK | — |
| [P4-02](./P4-02-democontrols-presentation.md) | DemoControls 呈现：低调进度胶囊 + free-click 提示 + 隐藏 | AFK | P4-01 |
| [P4-03](./P4-03-capabilities-subscription.md) | Capabilities 域包订阅管理（Track B） | AFK | — |

Track A（01→02）与 Track B（03）**完全独立、可并行**。rail 的 B4 只 `goScene('capabilities')`，不关心页内容丰俭。

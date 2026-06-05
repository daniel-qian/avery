# P5 polish — build issues（本地，未发 GitHub）

> 注：`.to-issues/README.md` 属 P2(Nexus)、`P3-*` 属 P3(详情)、`P4-*` 属 P4(rail)。P5 索引在本文件，issue 文件以 `P5-` 前缀命名，避开冲突。

来源：2026-06-05 `/grill-with-docs` 会话锁定的 P5 设计决策（Danny 桌上 6 条）。
权威 doc：
[ADR-0007](../docs/adr/0007-nexus-flow-uninterrupted-capabilities-closing-beat.md) Nexus 思考流不可打断 + Capabilities 收尾 beat ·
[ADR-0008](../docs/adr/0008-in-thread-chat-object-human-loop-as-central-card.md) in-thread Chat 对象 ·
[ADR-0009](../docs/adr/0009-state-aware-detail-pages-supersedes-0005.md) state-aware 详情页（supersede 0005）·
[ADR-0010](../docs/adr/0010-calm-cards-gamified-hp-mp-hud.md) calm 卡游戏化 HP/MP ·
[CONTEXT.md](../CONTEXT.md)（新增 **Chat** 词条）·
[demo-brief](../docs/20260603-design/demo-brief.md) beat sheet ·
[ADR-0002](../docs/adr/0002-frontend-stack-vite-react-framer-motion.md) 动效护栏 ·
[ADR-0006](../docs/adr/0006-rail-driver-is-stateless-replay-to-target-over-frozen-store.md) rail replay-safe。

## 铁律（每个 issue 都适用）

- **不扩冻结的 `canvasStore`**：只读 `thread.steps` 派生 OK，只调已锁 action（`runAgent / dispatchTask / regenBriefing / askQuestion / goScene / setFocus / openDetail / back`）。
- CSS 只追加 `global.css` 各 phase banner，不动共享基座。
- **ADR-0002 动效护栏**：只动 `transform`/`opacity`，**别 tween width/height**，别处处 blur，守 `prefers-reduced-motion`。
- **ADR-0006 rail replay-safe**：SCRIPT 每步幂等 / append 序确定；`seek` = 倒带 + 同步 replay。
- Venus-facing 新英文 copy 标 `⚠ 待 Danny 审字`（**就地标**，本期不单开审字 slice）。
- `npm run build`（`tsc -b` 零错 + vite）必须保持过。

## 切片与依赖

| # | 切片 | 类型 | Blocked by |
|---|---|---|---|
| [P5-01](./P5-01-capabilities-out-of-flow-closing-beat.md) | #3 Capabilities 移出思考流 + 独立 13/13 收尾 beat | AFK | — |
| [P5-02](./P5-02-in-thread-chatcard.md) | #6 in-thread ChatCard（B7 升级中央卡 + 脚本 transcript） | AFK | — |
| [P5-03](./P5-03-state-aware-detail-pages.md) | #5 state-aware 详情页（believed/grown phase） | AFK | — |
| [P5-04](./P5-04-rail-act1-act3-drill-beats.md) | #5 rail Act1 前置 drill + Act3 警告解除落点 | AFK | P5-03 |
| [P5-05](./P5-05-composer-persistent-expand-reference.md) | #1 composer 常驻 + 展开 + `+` 引用 picker | AFK | — |
| [P5-06](./P5-06-gamified-hp-mp-cards.md) | #2 HP/MP 卡渲染 + mood fixture（HP=headroom，占位 avatar） | AFK | — |
| [P5-07](./P5-07-nexus-nodes-progressive-reveal.md) | #4 Nexus 节点逐个渐显 | **HITL** | P5-01·P5-02（软） |
| [P5-08](./P5-08-pixel-avatar-sprites.md) | #2 像素 avatar sprite 资产（替换占位） | **HITL** | P5-06 |

## 并行 / 同文件提醒

- **P5-01 与 P5-04 同改 `railStore.ts`（SCRIPT）**——逻辑独立，建议串行或注意 merge。
- **P5-05 与 P5-06 同改 `DashboardScene.tsx`**——同上。
- 三条 track 大体可并行：**Nexus 流**（01 / 02 / 07）· **详情页 + rail**（03 → 04）· **Dashboard 表面**（05 / 06 → 08）。
- **HITL**：P5-07（动效 feel 走 motion-ref 循环，需 Danny 参考 + 验收）、P5-08（像素美术方向，需 Danny 提供）。其余 AFK。

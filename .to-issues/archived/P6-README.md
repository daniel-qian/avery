# P6 multi-thread Nexus + errand cases — build issues（本地，未发 GitHub）

> 注：`.to-issues/README.md` 属 P2、`P3-*`/`P4-*`/`P5-*` 各归其 wave。P6 索引在本文件，issue 文件以 `P6-` 前缀命名。

来源：2026-06-10 `/grill-with-docs` 会话（更多 case + follow-up + 多 thread）。
权威 doc：
[ADR-0013](../docs/adr/0013-multi-thread-nexus-case-definitions-follow-up.md) **本 wave 的总规约**（contract pass、case 数据形、follow-up、errand cases、三幕 rail）·
[CONTEXT.md](../CONTEXT.md)（新增 **Thread** / **Follow-up** 词条）·
[ADR-0003](../docs/adr/0003-demo-rail-is-detachable-driver-over-free-click-core.md) rail 可拆 + free-click litmus ·
[ADR-0006](../docs/adr/0006-rail-driver-is-stateless-replay-to-target-over-frozen-store.md) replay-to-target ·
[ADR-0007](../docs/adr/0007-nexus-flow-uninterrupted-capabilities-closing-beat.md) Capabilities 收尾 beat ·
[ADR-0012](../docs/adr/0012-pannable-zoomable-canvas-rail-derived-camera.md) 画板 / 镜头 / world-HUD ·
[ADR-0002](../docs/adr/0002-frontend-stack-vite-react-framer-motion.md) 动效护栏。

## 铁律（每个 issue 都适用）

- **store 契约规则已换版**：旧"不扩冻结的 `canvasStore`"被 ADR-0013 取代——P6-01 是**唯一一次** contract pass（解冻 → 重塑 → 重新冻结）；P6-02 起一律**不扩 ADR-0013 重塑后的契约**，只调新锁定的 action 集（`runAgent / dispatchTask / regenBriefing / askQuestion / goScene / setFocus / openDetail / back / openThread / closeThread / askFollowUp / sendEmail`）。
- **镜头命令不进 store**（ADR-0012）：点 Manifest 的 zoom 走组件本地 ref；rail 下一拍照常收回。
- CSS 只追加 `global.css` 的 `/* P6 */` banner 区，不动共享基座。
- **ADR-0002 动效护栏**：只动 `transform`/`opacity`，别 tween width/height，守 `prefers-reduced-motion`。
- **ADR-0006 replay-safe**：SCRIPT 每步幂等 / append 序确定；`sendEmail` / `dispatchTask` / 草稿编辑**不进 SCRIPT**（现场 Danny 手点，seek 重置接受）。
- Venus-facing 新英文 copy 就地标 `⚠ 待 Danny 审字`；本期**另有** P6-08 统一审字收口。
- `npm run build`（`tsc -b` 零错 + vite）必须保持过。

## 切片与依赖

| # | 切片 | 类型 | Blocked by | 状态 |
|---|---|---|---|---|
| [P6-01](./P6-01-contract-pass-multithread-case-shape.md) | contract pass：多 thread store + per-case 定义数据形（bill/acme 迁移，行为零变） | AFK | — | ✅ e480bdd |
| [P6-02](./P6-02-thread-chrome-tabs-history.md) | thread chrome：Nexus HUD tab strip + history popover | AFK | P6-01 | ✅ 897c616 |
| [P6-03](./P6-03-follow-up-machinery-billacme.md) | follow-up 机器 + bill/acme follow-up 内容 | AFK | P6-01 | ✅ 200c3d0 |
| [P6-04](./P6-04-context-window-hud.md) | context-window HUD（Context % · Step x/x，每 thread） | AFK | P6-01 | ✅ 2e33f80 + 1db6b2f |
| [P6-05](./P6-05-web-search-errand-case.md) | web-search errand case（Apple 政策 + 浏览器预览 + gist） | AFK | P6-01 · P6-03 | ✅ 61609b9 |
| [P6-06](./P6-06-email-errand-case.md) | email errand case（memo 照片 → 草稿 → email tool → Send） | AFK | P6-01 · P6-03 | ✅ bf45f09 |
| [P6-07](./P6-07-rail-three-acts-title-cards.md) | rail 三幕集成 + title card 浮层 + close→reopen 收束拍 | AFK | P6-02…P6-06 | ✅ 449d30f |
| [P6-08](./P6-08-narrative-copy-review.md) | 叙事 & 审字收口（全部 ⚠ 标记 + 真 memo 照片） | **HITL** | P6-03 · P6-05 · P6-06 | ✅ 待 Danny（交接材料 0914079） |

## 并行 / 同文件提醒

- **P6-01 先行、独占**：它重塑 `canvasStore` + 把 `nexusLayout` 常量迁进 case 定义，动面最大；02–06 全部等它落地后再开。
- **P6-02 / P6-03 / P6-04 同改 `NexusScene.tsx` + `global.css`（HUD 区）**——逻辑独立，建议串行或留意 merge。
- **P6-05 / P6-06 大体可并行**（各自新增 case 定义文件 + 资产），但都登记进同一 case 注册表 + 各自新 manifest 卡 CSS——留意小 merge。
- **P6-07 独占 `railStore.ts`（SCRIPT）+ `DemoControls`**——必须最后，等 02–06 全绿。
- **HITL**：仅 P6-08（Danny 审字 + 换真照片 + 现场 feel 验收）。其余 AFK。

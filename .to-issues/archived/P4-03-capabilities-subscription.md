# P4-03 · Capabilities 域包订阅管理（Track B）

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

把 `CapabilitiesScene`（P3-04 的 sell 页）富化成**可浏览 + 可自助订阅管理的目录**（Q6–8）。定位锁定：**单一供应商策展目录**——供货方仍是 TeamMaster 一手，**非 UGC / 多供应商市场**；护城河 / CONTEXT / B4 叙事**不变**。订阅管理是该订阅制下的产品功能，"browse + 订阅/退订"强化"可见的 SaaS 扩张收入"信号。

**数据（`fixtures.p3.ts`，additive，不改共享 `fixtures.ts`）**
- 6 个**域包**（订阅最小单位）：`HR / PM` 默认 **subscribed**（= agent 实际引用的 `cap_hr_interrupt` / `cap_po_dep` 所在域）；`Legal / Finance / Ops / Sales` 默认 **available**。
- 每包：`title + gist + 2–3 条 preview playbook 名`。新增的 Venus-facing 英文 copy 标 **`⚠ 待 Danny 审字`**（本片验收内自审，不另开 HITL）。
- 与现有 `loadedCapabilityDomains()` / coverage 条的 `loaded` 概念**对齐**（loaded ⇔ subscribed），别造第二套真相。

**UI（`CapabilitiesScene.tsx`）**
- moat banner 仍作 **hero**（proprietary / subscription / auto-cited 不动）。
- 加两区：**"Your coverage"**（已订包 + `Unsubscribe`）/ **"Expand your coverage"**（可订包 + `Subscribe`，含包内 preview playbook）。
- 订阅态 = **本地 `useState`**（不扩 store），切换**纯页面级表演**：**不跨耦合**——退订 HR **不影响** Nexus 里 agent 的引用（agent 永远引用它那 2 条）。
- **不进 rail 脚本**：B4 drill 只 `goScene('capabilities')` 落到这页；Danny 可现场 free-click 演示订阅/退订（可选）。

## Acceptance criteria

- [x] 6 域包渲染，分 "Your coverage"（HR/PM）/ "Expand your coverage"（Legal/Finance/Ops/Sales）两区。
- [x] 每个可订包 `Subscribe`、已订包 `Unsubscribe`，点击切换本地态并在两区间移动。
- [x] moat banner 仍是页顶 hero；视觉沿用其余 scene 语汇。
- [x] 切换订阅**不碰 `canvasStore` / 不影响 Nexus** agent 引用（纯本地表演）。
- [x] 新增英文 copy 全标 `⚠ 待 Danny 审字`；与既有 `loaded` 对齐无双真相。
- [x] 不扩 store；CSS 追加 P4 banner；`npm run build` 过。

## Blocked by

None — 可立即开始（与 Track A 完全独立，可并行）。

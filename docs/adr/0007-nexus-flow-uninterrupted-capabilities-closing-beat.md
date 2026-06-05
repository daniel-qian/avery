# Nexus 思考流不可打断；整页 drill-in 仅前戏/落地段；Capabilities 独立成收尾 beat

## 背景

demo-brief beat sheet 把 Capabilities 整页 drill 放在 B4（思考流中段，`railStore` idx 5/6），Bill 整页 drill 放在 B6（idx 9/10）。本 session grill 指出：这些 `goScene` / `openDetail` 跳出 Nexus 再跳回，**打断"agent 连续思考"的展示**。同时 Capabilities 是护城河 / 盈利点，3 秒 drive-by 配不上它的分量。

## 决策

12 beat 切三段，**思考流段零整页 drill-in**：

- **前戏**（B0–B3：onboarding / calm / focus / ask）：drill-in、side-trip 随便走。
- **思考流**（B4–B9：PM agent → mismatch → HR 根因 → chat 确认 → timeline → 结构化输出）：**零整页 drill-in**，只在 Nexus 场景内用卡片 / 节点演进。
- **落地 + 收尾**（B9b 项目页 handoffs 落地 → B10 dashboard 闭环）：drill-in OK（结果落地，非打断思考）。

据此：Capabilities 从 B4 移除（删 `railStore` idx 5/6 + `NexusScene.tsx` 的 `Open Capabilities reference →` inspector 按钮），**新增独立收尾 beat 排在 B10 之后（13/13）= 护城河 + 订阅营收的投资人收束论证**。Topbar Capabilities tab 保留供 free-click（守 ADR-0003 litmus）。

（#4「agent 节点逐个渐显」是这条流"不可打断"的动效表达，走 motion-ref 循环实现，不在本 ADR。）

## 被否的替代

- **Capabilities 留在 B4 但缩短**：否决——与"不打断思考流"+"护城河要单独说"两条都冲突。
- **Capabilities 贴 B10 之前**（让闭环作最后一下）：grill 确认放最后——投资人 demo 收在"为什么护得住 + 怎么赚钱"是强收尾；闭环高潮在 12/12，13/13 是刻意的商业 coda。

## 后果

- rail 12 → 13 beat；新 beat 是 `goScene('capabilities')`，replay-safe（ADR-0006）。
- **反转本 session grill 的 Q4**（B4 整页 drill 进 Capabilities）；触及 demo-brief beat sheet（B4 改写）与 ADR-0004「遗留张力 A」对 B4 的处理。
- Bill 整页 drill 的移除 + 改造见 ADR-0009（state-aware 详情页）。

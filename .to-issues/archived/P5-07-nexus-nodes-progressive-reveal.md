# P5-07 · #4 Nexus 节点逐个渐显

类型：**HITL**（动效 feel，走 motion-ref 循环）· Blocked by：**软依赖 P5-01 · P5-02**

## What to build

思考流里 agent 工作节点**逐个渐显**，演出「agent 一步步思考」的过程，而非一次画全所有 `NEXUS_NODES` 再套 calm/focus 的 opacity（grill #4）。

- 改 `src/lib/nexusFlow.ts` 的 reveal 派生：future 节点在到达前**不画 / 不占视觉**，到达时**淡入**（`opacity`/`transform`）。现有 `is-future / is-active / is-complete` 三态保留，新增「未揭示（unrevealed）」判定——只有已到达的 step 所属节点集才进入可见集。
- 与 ChatCard（P5-02）协调：`human-loop` 节点 / 卡的出现纳入同一渐显语汇。
- 守 ADR-0002：只 `transform`/`opacity`，`prefers-reduced-motion` 降级为瞬显；**replay-safe**——`seek` 到任一 beat 直接呈现该 beat 的「已揭示集」，**不回放动画**、无闪。
- **motion feel**（时序 / 缓动 / stagger）按 handoff §1 走**增量循环**：Danny 给 URL / 录屏 / 截图参考，逐版调；可记 `docs/20260603-design/motion-refs.md`。

## Acceptance criteria

- [ ] 思考流推进时节点逐个淡入（非开局全画）；**Danny 确认 feel**。
- [ ] `seek` / replay 到中途 beat 直接显该 beat 已揭示节点集，无动画回放、无闪。
- [ ] `prefers-reduced-motion` 下降级为瞬显。
- [ ] 不动 width/height；不扩 `canvasStore`；`npm run build` 过。

## Blocked by

软依赖 **P5-01**（流清干净后渐显序列才干净）、**P5-02**（ChatCard 纳入渐显语汇）。
**HITL**：需 Danny 的 motion 参考 + feel 验收，非纯 AFK。

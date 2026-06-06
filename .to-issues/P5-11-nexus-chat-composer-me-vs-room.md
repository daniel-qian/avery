# P5-11 · Nexus Chat composer + me-vs-room

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

升级 B7 ChatCard 的表面，让它读起来像真实多人协同 chat，但不改变 [ADR-0008](../docs/adr/0008-in-thread-chat-object-human-loop-as-central-card.md) 锁定的 Chat 生命周期。

ChatCard 增加 **full composer UI**：真实 input affordance + send affordance。composer 是纯 UI / 本地态，不改 `askQuestion`、不写入 thread、不允许人主动开 channel 或重开 channel。Chat 仍只在 `activeStep === 'human-loop'` 出现，仍是 agent 发起、绑定单个决策、用完即合、沉淀进 report。

Chat transcript 改成 **me-vs-the-room** 布局：`speaker === 'You'` 的消息独占一侧；Bill + PM agent + HR agent 在另一侧。agent 消息带 badge，用来和 Bill 这种人类 participant 区分。必要时调整 `HUMAN_LOOP` fixture 的 speaker / role metadata，但不扩 store。⚠ Venus-facing 新英文 copy 就地标 `⚠ 待 Danny 审字`。

## Acceptance criteria

- [ ] B7 ChatCard 底部有 full composer UI：input + send affordance，视觉上像可输入 chat。
- [ ] composer 不改变 Chat 生命周期：不能主动打开 / 重开 chat，不写入 persistent thread，不扩 store。
- [ ] `You` 消息与 Bill / agents 分侧；Bill 与 agents 同属 room 侧。
- [ ] PM agent / HR agent 有清晰 badge，和 Bill 区分。
- [ ] transcript 仍支撑 B8 timeline / B9 report 的因果，不引入新产品承诺。
- [ ] 布局和进出场守 ADR-0002：只用 `opacity` / `transform`，支持 `prefers-reduced-motion`；`npm run build` 过。

## Blocked by

None — 可立即开始。

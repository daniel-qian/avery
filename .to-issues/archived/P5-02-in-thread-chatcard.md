# P5-02 · #6 in-thread ChatCard（B7 升级中央卡）

类型：**AFK**（新英文 copy 标 `⚠ 待审字`）· Blocked by：**None — 可立即开始**

## What to build

B7 `human-loop` 从 inspector 轻量步**升级为中央卡片**（与 mismatch / timeline / output 卡同级），渲染脚本化多人对话，兑现 **in-thread Chat 对象**（[ADR-0008](../docs/adr/0008-in-thread-chat-object-human-loop-as-central-card.md)；术语见 CONTEXT 的 Chat 词条）。

- 新建 `ChatCard` 组件，`activeStep === 'human-loop'` 时渲染中央（参照现有 `MismatchCard` / `TimelineCard` / `StructuredOutputCard` 的 `show*` 模式）。
- 扩写 `HUMAN_LOOP` fixture 为**脚本化 transcript**：参与方 = Bill（owner）+ 你（manager POV）+ PM agent + HR agent；Jason 被**提及但不在场**。对话职责 = Bill **确认**根因（被打断、非低产）+ 各方**敲定**修法（甩 interrupt 给 Jason / 砍 scope 保周五）→ 喂 B8 timeline + B9 report。agent 消息可带 evidence / Capability 引用标记（体现"在场协同方"，非被 @ 才动的 bot）。⚠ 全部 Venus-facing 英文 copy 标 `⚠ 待 Danny 审字`。
- 消息**逐条渐显**（`opacity`/`transform` 进场，守 `prefers-reduced-motion`）。
- inspector 不再承载 `human-loop`（已毕业到中央卡）。
- CSS 进 `global.css` 的 `/* P2 · Nexus */` banner。

**守约**：与现有中央卡同一套——读扩写后的 fixture、由 `thread.steps` 派生显隐，**不扩 store**；逐条渐显是进场动画，`seek` 到 B7 直接呈现完整对话（不回放），replay-safe。

## Acceptance criteria

- [ ] B7 渲染中央 ChatCard，含 ≥4 条多人消息（Bill + 你 + PM agent + HR agent），逐条渐显。
- [ ] 对话内容支撑 B8 timeline / B9 report 的因果（确认根因 + 敲定修法）。
- [ ] `activeStep` 离开 `human-loop` 时 ChatCard 收起；inspector 不再显 human-loop 文案。
- [ ] 不扩 `canvasStore`；`seek` 到 B7 稳定无闪。
- [ ] 新英文 copy 标 `⚠ 待 Danny 审字`。
- [ ] `prefers-reduced-motion` 下降级为瞬显；`npm run build` 过。

## Blocked by

None — 可立即开始。

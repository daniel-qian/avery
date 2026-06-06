# Nexus thread 内嵌 Chat 对象；B7 human-loop 升级为中央 chat 卡（amend ADR-0004 §5）

## 背景

CONTEXT 把 Nexus 定义为编排面、明令 `_Avoid_: chat`；ADR-0004 §5 把契约里删不掉的 B7 `human-loop` step **轻量兑现**为 inspector 一行字 + Bill 节点点亮。Danny 反馈（#6）：这既没演出"人在确认"，也没承载他要的"多人 + agent 来回"。grill 厘清：这是**两个不同产品对象**——`Nexus thread`（编排骨架）与嵌在其中的 `Chat`（多人协同面）。

## 决策

引入 **Chat 对象**（术语定义已落 `CONTEXT.md`），四条约束让它不是 Slack / ChatGPT：① agent 发起（靠信号 / Capabilities 推不出、必须要人裁断时才召集）；② 绑定单个决策、用完即合（ephemeral）；③ agent 是在场协同方，主动抛 evidence + Capabilities；④ 产出结构化沉淀进 report、成为 provenance。术语就叫 `chat`（不另起 clever name），glossary 划清「Nexus ≠ Chat；禁令针对别把整个 Nexus 叫聊天，Chat 是其内的窄口径子面」。

B7 从 inspector 轻量步**毕业到中央卡片组**（与 mismatch / timeline / output 卡同级）：`activeStep === 'human-loop'` 渲染 ChatCard，内含**脚本化多人对话**（Bill + 你 + PM agent + HR agent；Jason 被提及不在场），消息逐条渐显。叙事职责 = Bill **确认**根因（被打断、非低产）+ 各方敲定修法（甩 Jason / 砍 scope）→ 喂 B8 timeline + B9 report。

## 被否的替代

- **不要 Chat 对象、人参与只作 Nexus 内结构化触点**：Danny 否——多人来回需要独立面。
- **Chat 做成可随手开的常驻面 / 人也能主动发起**：否决——会塌成"带 AI 的 Slack"、稀释护城河；锁死 agent-发起 + ephemeral。

## 后果

- 新建 ChatCard 组件 + CSS（写入 `global.css` 的 `/* P2 · Nexus */` 区）；扩写 `HUMAN_LOOP` fixture 为脚本化 transcript。
- **不扩 store**——与现有中央卡同一套：读 fixture、由 `thread.steps` 派生显隐，逐条渐显是进场动画，replay-safe（ADR-0006）。
- **amend ADR-0004 §5**：B7 不再是 inspector 轻量步。
- 净收益：B7 是 pitch "经人确认" 唯一发生处，升级 = 直接兑现核心卖点，非 scope 膨胀。
- **P5 迭代（grill 2026-06-06，#2 反馈）**：ChatCard 加 **full composer UI**（真输入框 + 发送）+ **me-vs-the-room 布局**（"You" 独占一侧；Bill + agents 另一侧，agents 加 badge 区分于 Bill）——修复"You / Bill 同侧"+ "不像 chat"两个反馈。⚠ composer 是**纯 input affordance**，**不改本 ADR 的 ①②④**：仍 agent-发起、绑定单决策、用完即合、沉淀进 report；**人不能主动开 / 重开 channel**（守"非 Slack"）。被否的「人也能主动发起 / 常驻面」未被翻转——本次只丰富 UI，不动生命周期。

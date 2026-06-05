# Nexus = 独立放射编排画布,线性推进 + 预置语义拓扑

> **§5（B7 human-loop）已被 [ADR-0008](0008-in-thread-chat-object-human-loop-as-central-card.md) amend**：B7 不再是 inspector 轻量步，升级为中央 ChatCard（内嵌 Chat 对象）。本 ADR 其余决策仍 accepted。

## 背景

CONTEXT.md 把 Nexus 定义为行动面——"一个问题变成一条被编排的线程;specialist agents 与人类同事协同;agent 背景聆听、交叉校对证据;调 tools;产出结构化输出",并明确"别低估其多 agent 编排本质"。demo-brief 要求 Nexus"复用 Dashboard 连线语汇"。P0.5 contract pass 已把状态契约冻结(见 `src/store/canvasStore.ts`):`thread.steps[]`(append-only `{kind}`,kind ∈ B4–B9)、无参 `runAgent()` 按写死的 `ORCHESTRATION` 常量线性推进、外加 `.flow-node` 的 `is-future/is-active/is-complete` 三态 CSS。P2 在"契约只读、不扩 store、不动共享基座"前提下,需定 Nexus 的空间形态与呈现。

## 决策

1. **独立放射/有机编排画布**,而非在 Dashboard 那张人/项目地图上原位编排。节点造型 + 贝塞尔连线语汇复用 Dashboard(`edges.ts` / `flow-node` 基类),保视觉连续 = "同一产品的两面"。
2. **推进 = 契约的无参 `runAgent()` 线性走 `ORCHESTRATION`(驱动"模型 1")**,不做自由乱序触发("模型 3")。free-click = 点画布"当前活跃节点/推进区"调 `runAgent()`;rail 的 Next 调同一个 `runAgent()`——同一 action、零 `if(demoMode)`,满足 ADR-0003 litmus。
3. **拓扑 = 预置语义节点,step 点亮节点组("拓扑 Y")**:常驻节点 Question / PM agent / HR agent / Evidence(簇)/ Project-Ops cap / HR cap / Bill / Tool / Output;每个 step kind 点亮其一组并长出连线。节点三态从 `thread.steps` **纯派生**(归属步是否已达到/是否当前),零扩 store。
4. **分层呈现**(承 calm→focus 密度哲学):`.nexus-inspector`(右下)承载轻量步(`pm-agent` / `hr-root-cause` / `human-loop`)与 `timeline` 的中卡;B5 `cross-check`(killer beat)升级为偏中央的 **mismatch 对撞卡**(reported on-track ↔ signals at-risk);B9 `structured-output`(Venus 逐字读)升级为**中央 report 面板**(`AGENT_OUTPUT` 6 段 + 派 task 行调 `dispatchTask`)。`timeline` B8 用中卡呈现 `TIMELINE` 里程碑。
5. **B7 `human-loop` 轻量兑现**:契约已把它写进 `ORCHESTRATION`(P2 砍不掉),故渲染为 Bill 人类节点进入线程 + 一句"agent 背景聆听"文案(新增 `HUMAN_LOOP` fixture);把"被迫渲染"转化为兑现 Nexus 定义里"人机协同"卖点的净收益。

## 被否的替代

- **Dashboard 原位编排**:人/项目地图塞不下 agent/capability/tool/output 这些抽象节点,而它们正是多 agent 编排卖点。被否。
- **驱动模型 3(`runAgent(stepId)` 自由乱序触发)**:grill 中一度认同,但与已冻结的无参 `runAgent` 契约冲突。litmus 不要求乱序;固定顺序反而防 Venus 面前点错产出无意义中间态;不值得为"理论自由"解冻三方共享契约。接受模型 1。
- **拓扑 X(step 即节点,6 节点线性链)**:最省、最贴 `steps[]`,但一条线讲不出"PM + HR 双 agent 同台"。被否。

## 后果

- P2 新建(均不碰共享基座 / store):Nexus 专属手工坐标(放射布局)、`step→nodes` 纯派生映射、Nexus 版 `SvgEdgeLayer`(自己的边集,按 `thread.steps` 进度决定哪些边已长出)、`.mismatch-card` / report 面板 CSS(写进 `global.css` 的 `/* P2 · Nexus */` banner 区)、`HUMAN_LOOP` fixture。
- **遗留张力 A**:`back()` 写死回 `dashboard`,从 Nexus 做 scene 级 drill-in(Capabilities/Employee 整页)回不到 Nexus。P2 规避——B4/B6 用 inspector/浮层在 Nexus 内展开 capability gist 与 Bill 信息;整页 scene 级 drill-in 交 P3 scene + P4 rail(rail 用 `goScene('nexus')` 回,不用 `back()`)。
- **遗留张力 B**:`DashboardScene` 现硬编码 `import BRIEFING_V1`,未读 `store.briefing`,故 B10 `regenBriefing()` 当前无可见效果。B10 的**触发**(structured-output 后"Return to dashboard"按钮 → `regenBriefing()` + `goScene('dashboard')`)在 P2;Briefing V2 **渲染 + orbit 重排**在 P1——需 P1 把 `DashboardScene` 改为读 `store.briefing`。
- 承 ADR-0003:删 rail = 删 `SCRIPT` + `DemoControls`,不删任何行为;上述每个 beat 自由点击仍可达。

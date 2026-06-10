# Slice 1 — Nexus 放射画布骨架（tracer bullet）

## What to build

Nexus 的放射编排画布骨架——P2 的地基。`NexusScene` 消费已冻结的 `thread` state,把编排渲染成预置语义节点的放射拓扑（ADR-0004 的"拓扑 Y"），`runAgent()` 线性推进点亮节点、连线随进度长出。本片节点**只显 kind 标签**,展开内容留后续片。

常驻语义节点:Question / PM agent / HR agent / Evidence(簇) / Project-Ops cap / HR cap / Bill / Tool / Output。每个 step kind 点亮其对应的一组节点(映射见 ADR-0004 的 step→nodes 表)。节点三态(`is-future` / `is-active` / `is-complete`)从 `thread.steps` **纯派生**:已入列且非末尾 = complete,末尾 = active,未达到 = future。

新建(均不碰共享基座 / store):

- Nexus 专属手工坐标(放射布局,新数据文件,类比 `src/data/layout.ts` 的 `PERSON_POS`)。deterministic,不上 layout 引擎。
- `step → nodes` 纯派生映射(纯函数吃 `thread.steps` + fixtures)。
- Nexus 版 edge layer(自己的边集,复用 `src/lib/edges.ts` 的 `edgePath`;按 `thread.steps` 进度决定哪些边可见)。

CSS 复用基座已有的 `.flow-node` 三态 / `.nexus-flow-layer`;新增样式写进 `global.css` 的 `/* P2 · Nexus */` banner 区。

## Acceptance criteria

- [ ] 进入 nexus scene(经 `askQuestion` 或 `goScene('nexus')`)后,画布显示放射排布的语义节点,初始多数为 `is-future`(暗 0.27)
- [ ] 每次 `runAgent()` 推进一步:对应节点组 future→active、上一步转 complete,符合 ADR-0004 step→nodes 映射
- [ ] 连线随 `thread.steps` 进度逐条长出(仅 transform/opacity 过渡)
- [ ] 节点态完全从 `thread.steps` 派生——未新增任何 store state / action
- [ ] 节点呈 calm 密度:仅 kind 标签 + 极简文字,不全展开
- [ ] `npm run build` 过(tsc 零类型错 + vite 成功)

## Blocked by

None - can start immediately

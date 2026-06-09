import type { Pos } from './board'
import type { ThreadStepKind } from '../store/canvasStore'

export type NexusNodeId =
  | 'question'
  | 'pm-agent'
  | 'hr-agent'
  | 'evidence'
  | 'project-ops-cap'
  | 'hr-cap'
  | 'bill'
  | 'tool'
  | 'output'

export interface NexusNode {
  id: NexusNodeId
  kind: string
  label: string
  detail: string
}

export interface NexusEdge {
  id: string
  from: NexusNodeId
  to: NexusNodeId
  step: ThreadStepKind
}

export const NEXUS_NODE_ORDER: NexusNodeId[] = [
  'question',
  'pm-agent',
  'hr-agent',
  'evidence',
  'project-ops-cap',
  'hr-cap',
  'bill',
  'tool',
  'output',
]

export const NEXUS_NODES: NexusNode[] = [
  {
    id: 'question',
    kind: 'Question',
    label: 'Acme ship risk',
    detail: 'Manager asks what the system should verify.',
  },
  {
    id: 'pm-agent',
    kind: 'PM agent',
    label: 'Delivery path',
    detail: 'Checks dependencies, status, scope, and deadline pressure.',
  },
  {
    id: 'hr-agent',
    kind: 'HR agent',
    label: 'Workload cause',
    detail: 'Separates output signals from interruption load.',
  },
  {
    id: 'evidence',
    kind: 'Evidence',
    label: 'Signal cluster',
    detail: 'Slack, GitHub, tasks, and reported status.',
  },
  {
    id: 'project-ops-cap',
    kind: 'Project-Ops cap',
    label: 'Dependency playbook',
    detail: 'Deadline risk framing before reassignment.',
  },
  {
    id: 'hr-cap',
    kind: 'HR cap',
    label: 'Interrupt overload',
    detail: 'Do not infer performance from a single stalled signal.',
  },
  {
    id: 'bill',
    kind: 'Bill',
    label: 'Human loop',
    detail: 'Owner enters the thread while agents keep listening.',
  },
  {
    id: 'tool',
    kind: 'Tool',
    label: 'Timeline builder',
    detail: 'Re-baselines the plan against the Friday ship.',
  },
  {
    id: 'output',
    kind: 'Output',
    label: 'Structured report',
    detail: 'Conclusion, evidence, uncertainty, actions, confirmations.',
  },
]

// P5 ④ (ADR-0012 决策 3 + 修订)：放射 topology 不变（决策 2/ADR-0004 保留），仅把坐标
// 从「视口百分比」搬进 board 像素。源 topology 仍以 0–100 描述（易读），模块加载时按公式
// 映射到 board 空间：flow 居中在 board 中轴、向下延申；右侧 board 区留给中央结果卡。
const NEXUS_POS_PCT: Record<NexusNodeId, Pos> = {
  question: { x: 50, y: 17 },
  'pm-agent': { x: 32, y: 34 },
  'hr-agent': { x: 68, y: 34 },
  evidence: { x: 50, y: 46 },
  'project-ops-cap': { x: 22, y: 59 },
  'hr-cap': { x: 78, y: 59 },
  bill: { x: 66, y: 71 },
  tool: { x: 34, y: 72 },
  output: { x: 50, y: 87 },
}

// pct → board px。flow 横向居中（board 中轴 ±500），纵向 320→2520 向下铺；右侧 board 留给结果卡。
function toBoard(pct: Pos): Pos {
  return {
    x: 1300 + ((pct.x - 50) / 100) * 1000,
    y: 320 + (pct.y / 100) * 2200,
  }
}

export const NEXUS_POS: Record<NexusNodeId, Pos> = Object.fromEntries(
  (Object.keys(NEXUS_POS_PCT) as NexusNodeId[]).map((id) => [id, toBoard(NEXUS_POS_PCT[id])]),
) as Record<NexusNodeId, Pos>

// 中央结果卡的 board 锚点（修订 4：结果卡是 world 对象、需真实 board 坐标，锚在各自簇旁的
// 右侧空带；每拍镜头飞向「活跃簇 ＋ 该卡」的局部包围盒）。half = 估算半宽/半高，仅供镜头算 bbox，
// 不必精确（padding 兜误差）。pm-agent / hr-root-cause 无中央卡 → 不在此表。
// nexus-brief（orchestration headline + 进度）的 board 锚点：顶部带，flow question 节点之上。
// calm 镜头保证开局必见。
export const NEXUS_BRIEF_POS: Pos = { x: 1300, y: 360 }

export interface CardAnchor {
  pos: Pos
  half: { w: number; h: number }
}

export const NEXUS_CARD_ANCHORS: Partial<Record<ThreadStepKind, CardAnchor>> = {
  'cross-check': { pos: { x: 2100, y: 1420 }, half: { w: 310, h: 280 } },
  'human-loop': { pos: { x: 2100, y: 1320 }, half: { w: 280, h: 300 } },
  timeline: { pos: { x: 2100, y: 1430 }, half: { w: 340, h: 300 } },
  'structured-output': { pos: { x: 2100, y: 1470 }, half: { w: 380, h: 360 } },
}

export const NEXUS_EDGES: NexusEdge[] = [
  { id: 'question-pm', from: 'question', to: 'pm-agent', step: 'pm-agent' },
  { id: 'pm-evidence', from: 'pm-agent', to: 'evidence', step: 'pm-agent' },
  { id: 'evidence-project-ops', from: 'evidence', to: 'project-ops-cap', step: 'pm-agent' },
  { id: 'project-ops-pm', from: 'project-ops-cap', to: 'pm-agent', step: 'cross-check' },
  { id: 'evidence-bill', from: 'evidence', to: 'bill', step: 'cross-check' },
  { id: 'question-hr', from: 'question', to: 'hr-agent', step: 'hr-root-cause' },
  { id: 'hr-bill', from: 'hr-agent', to: 'bill', step: 'hr-root-cause' },
  { id: 'bill-hr-cap', from: 'bill', to: 'hr-cap', step: 'hr-root-cause' },
  { id: 'hr-cap-hr', from: 'hr-cap', to: 'hr-agent', step: 'hr-root-cause' },
  { id: 'bill-pm', from: 'bill', to: 'pm-agent', step: 'human-loop' },
  { id: 'pm-tool', from: 'pm-agent', to: 'tool', step: 'timeline' },
  { id: 'hr-tool', from: 'hr-agent', to: 'tool', step: 'timeline' },
  { id: 'tool-output', from: 'tool', to: 'output', step: 'structured-output' },
  { id: 'evidence-output', from: 'evidence', to: 'output', step: 'structured-output' },
]

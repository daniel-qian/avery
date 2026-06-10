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

// P5 ⑦ (ADR-0012 修订 5+6)：放射 topology 退役 → 三条固定竖向 lane，链必须视觉笔直：
// 左 lane = PM 链（pm-agent / project-ops-cap / tool）、中脊 = 共享节点
// （question → evidence → bill → output）、右 lane = HR 链（hr-agent / hr-cap）。
// 节点 x 恒等于 lane x、y 按行号等距下行（全公式，不逐节点手摆）；跨链边自然成短对称斜线。
// 修订 6：Manifest 主角化——链压窄成左侧细带，右侧大头留给 Manifest 列。
const LANE_X = { pm: 420, spine: 700, hr: 980 } as const
const FLOW_TOP = 300
const FLOW_ROW_STEP = 320

const NEXUS_LANE: Record<NexusNodeId, { lane: keyof typeof LANE_X; row: number }> = {
  question: { lane: 'spine', row: 0 },
  'pm-agent': { lane: 'pm', row: 1 },
  'hr-agent': { lane: 'hr', row: 1 },
  evidence: { lane: 'spine', row: 2 },
  'project-ops-cap': { lane: 'pm', row: 3 },
  'hr-cap': { lane: 'hr', row: 3 },
  bill: { lane: 'spine', row: 4 },
  tool: { lane: 'pm', row: 5 },
  output: { lane: 'spine', row: 6 },
}

export const NEXUS_POS: Record<NexusNodeId, Pos> = Object.fromEntries(
  (Object.keys(NEXUS_LANE) as NexusNodeId[]).map((id) => [
    id,
    {
      x: LANE_X[NEXUS_LANE[id].lane],
      y: FLOW_TOP + NEXUS_LANE[id].row * FLOW_ROW_STEP,
    },
  ]),
) as Record<NexusNodeId, Pos>

// 修订 6：per-artifact 产出圆——四个产物各自从「产出节点」显形（节点渲染为圆形），
// 各卡连线源自自己的产出圆（取代修订 5 的单一 manifest node 连线源）。
export const MANIFEST_PRODUCERS: Partial<Record<ThreadStepKind, NexusNodeId>> = {
  'cross-check': 'evidence', // Reality Gap ← 信号簇（与自报相撞的证据）
  'human-loop': 'bill', // human chat ← Bill 入环
  timeline: 'tool', // 重排时间线 ← Timeline builder
  'structured-output': 'output', // 决策报告 ← output
}

export const MANIFEST_PRODUCER_IDS = new Set<NexusNodeId>(
  Object.values(MANIFEST_PRODUCERS),
)

// output 节点仍是链终点的「报告产出圆」，calm 起就以 ghost 在场（修订 5 语义保留）。
export const MANIFEST_NODE_ID: NexusNodeId = 'output'

export interface CardAnchor {
  pos: Pos
  half: { w: number; h: number }
}

// Manifest 列（修订 5+6）：结果卡按 step 顺序在右侧累积堆叠；修订 6 列左移、卡放大 ~25%、
// 左缘对齐（Manifest 是主角，链只是左侧细带）。锚点 y 由 half + 间隙公式推出，不手摆。
// half = 估算半宽/半高，仅供镜头算 bbox 与堆叠间距，不必精确（padding 兜误差）。
const MANIFEST_LEFT = 1240 // 所有卡的左缘 x
const MANIFEST_TOP = 320
const MANIFEST_GAP = 90

const MANIFEST_STACK: Array<[ThreadStepKind, { w: number; h: number }]> = [
  ['cross-check', { w: 380, h: 330 }],
  ['human-loop', { w: 360, h: 380 }],
  ['timeline', { w: 425, h: 350 }],
  ['structured-output', { w: 475, h: 460 }],
]

export const MANIFEST_LABEL_POS: Pos = { x: MANIFEST_LEFT + 400, y: 210 }

export const NEXUS_CARD_ANCHORS: Partial<Record<ThreadStepKind, CardAnchor>> = {}
{
  let stackY = MANIFEST_TOP
  for (const [step, half] of MANIFEST_STACK) {
    NEXUS_CARD_ANCHORS[step] = {
      pos: { x: MANIFEST_LEFT + half.w, y: stackY + half.h },
      half,
    }
    stackY += half.h * 2 + MANIFEST_GAP
  }
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

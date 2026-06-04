import type { Pos } from './layout'
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

export const NEXUS_POS: Record<NexusNodeId, Pos> = {
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

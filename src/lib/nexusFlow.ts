import type { ThreadStep, ThreadStepKind } from '../store/canvasStore'
import { NEXUS_NODE_ORDER, type NexusEdge, type NexusNodeId } from '../data/nexusLayout'

export type NexusFlowState = 'is-unrevealed' | 'is-future' | 'is-active' | 'is-complete'

export const NEXUS_STEP_NODES: Record<ThreadStepKind, NexusNodeId[]> = {
  'pm-agent': ['question', 'pm-agent', 'evidence', 'project-ops-cap'],
  'cross-check': ['pm-agent', 'evidence', 'project-ops-cap', 'bill'],
  'hr-root-cause': ['hr-agent', 'bill', 'hr-cap', 'evidence'],
  'human-loop': ['bill', 'pm-agent', 'hr-agent'],
  timeline: ['tool', 'pm-agent', 'hr-agent', 'bill'],
  'structured-output': ['output', 'tool', 'evidence', 'pm-agent', 'hr-agent'],
}

export function deriveNexusNodeStates(steps: ThreadStep[]): Record<NexusNodeId, NexusFlowState> {
  const states = Object.fromEntries(
    NEXUS_NODE_ORDER.map((id) => [id, 'is-unrevealed']),
  ) as Record<NexusNodeId, NexusFlowState>

  if (steps.length === 0) {
    states.question = 'is-active'
    return states
  }

  steps.slice(0, -1).forEach((step) => {
    NEXUS_STEP_NODES[step.kind].forEach((nodeId) => {
      states[nodeId] = 'is-complete'
    })
  })

  const current = steps[steps.length - 1]
  if (current) {
    NEXUS_STEP_NODES[current.kind].forEach((nodeId) => {
      states[nodeId] = 'is-active'
    })
  }

  return states
}

export function deriveNexusEdgeState(edge: NexusEdge, steps: ThreadStep[]): NexusFlowState {
  const firstReachedIndex = steps.findIndex((step) => step.kind === edge.step)
  if (firstReachedIndex === -1) return 'is-future'
  return firstReachedIndex === steps.length - 1 ? 'is-active' : 'is-complete'
}

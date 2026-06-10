import type { ThreadStep } from '../store/canvasStore'
import type { CaseDefinition, NexusEdge, NexusNodeId } from '../data/cases'

// P6-01 (ADR-0013)：节点/边状态派生泛化为「吃 case 定义」的纯函数——
// 每步点亮的节点簇住在 caseDef.stepNodes（原模块常量 NEXUS_STEP_NODES 已迁入 case 定义）。

export type NexusFlowState = 'is-unrevealed' | 'is-future' | 'is-active' | 'is-complete'

export function deriveNexusNodeStates(
  caseDef: CaseDefinition,
  steps: ThreadStep[],
): Record<NexusNodeId, NexusFlowState> {
  const states = Object.fromEntries(
    caseDef.nodeOrder.map((id) => [id, 'is-unrevealed']),
  ) as Record<NexusNodeId, NexusFlowState>

  if (steps.length === 0) {
    states.question = 'is-active'
    return states
  }

  steps.slice(0, -1).forEach((step) => {
    ;(caseDef.stepNodes[step.kind] ?? []).forEach((nodeId) => {
      states[nodeId] = 'is-complete'
    })
  })

  const current = steps[steps.length - 1]
  if (current) {
    ;(caseDef.stepNodes[current.kind] ?? []).forEach((nodeId) => {
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

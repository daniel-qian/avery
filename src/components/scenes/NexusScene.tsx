import { useMemo } from 'react'
import {
  HERO_QUESTION,
  MISMATCH,
  NEXUS_INSPECTOR_CONTENT,
  SIGNALS,
  type Signal,
} from '../../data/fixtures'
import { NEXUS_EDGES, NEXUS_NODES, NEXUS_POS, type NexusNodeId } from '../../data/nexusLayout'
import { edgePath } from '../../lib/edges'
import { deriveNexusEdgeState, deriveNexusNodeStates, NEXUS_STEP_NODES } from '../../lib/nexusFlow'
import { useCanvas, type ThreadStepKind } from '../../store/canvasStore'

const STEP_LABELS: Record<ThreadStepKind, string> = {
  'pm-agent': 'PM agent checks delivery evidence',
  'cross-check': 'Reality gap cross-check',
  'hr-root-cause': 'HR agent checks root cause',
  'human-loop': 'Bill enters the loop',
  timeline: 'Tool builds the re-baselined timeline',
  'structured-output': 'Structured output is ready',
}

function classNames(parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function nodeStyle(nodeId: NexusNodeId) {
  const pos = NEXUS_POS[nodeId]
  return { left: `${pos.x}%`, top: `${pos.y}%` }
}

const mismatchEvidence = MISMATCH.evidenceSignalIds
  .map((signalId) => SIGNALS.find((signal) => signal.id === signalId))
  .filter((signal): signal is Signal => Boolean(signal))

function NexusEdgeLayer({
  steps,
  activeStep,
}: {
  steps: { kind: ThreadStepKind }[]
  activeStep?: ThreadStepKind
}) {
  return (
    <svg
      className="nexus-edge-layer"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {NEXUS_EDGES.map((edge) => {
        const state = deriveNexusEdgeState(edge, steps)
        const isCollision = activeStep === 'cross-check' && edge.id === 'evidence-bill'
        return (
          <path
            key={edge.id}
            className={classNames(['nexus-edge-path', state, isCollision && 'is-collision'])}
            d={edgePath(NEXUS_POS[edge.from], NEXUS_POS[edge.to])}
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}

function MismatchCard() {
  return (
    <section className="mismatch-card" aria-label="Reality gap: report mismatch">
      <div className="mismatch-card-header">
        <p className="eyebrow">Reality gap</p>
        <h2>{MISMATCH.gapType}</h2>
      </div>

      <div className="mismatch-collision" aria-label="Reported status compared with work signals">
        <article className="mismatch-side">
          <span className="mismatch-label">Reported</span>
          <strong>{MISMATCH.reported}</strong>
          <p>Self-report from Monday standup.</p>
        </article>

        <div className="mismatch-versus" aria-hidden="true">
          <span />
        </div>

        <article className="mismatch-side is-signal">
          <span className="mismatch-label">Signals say</span>
          <strong>{MISMATCH.signalsSay}</strong>
          <p>Evidence from GitHub, Slack, and tasks.</p>
        </article>
      </div>

      <div className="mismatch-evidence">
        {mismatchEvidence.map((signal) => (
          <div key={signal.id} className="mismatch-evidence-row">
            <span>{signal.id}</span>
            <p>{signal.summary}</p>
          </div>
        ))}
      </div>

      <p className="mismatch-safe-framing">{MISMATCH.safeFraming}</p>
    </section>
  )
}

export function NexusScene() {
  const thread = useCanvas((s) => s.thread)
  const runAgent = useCanvas((s) => s.runAgent)
  const question = thread.question ?? HERO_QUESTION
  const nodeStates = useMemo(() => deriveNexusNodeStates(thread.steps), [thread.steps])
  const activeStep = thread.steps[thread.steps.length - 1]?.kind
  const showMismatch = activeStep === 'cross-check'
  const activeNodes = activeStep ? NEXUS_STEP_NODES[activeStep] : ['question']
  const inspectorContent =
    activeStep && activeStep in NEXUS_INSPECTOR_CONTENT
      ? NEXUS_INSPECTOR_CONTENT[activeStep as keyof typeof NEXUS_INSPECTOR_CONTENT]
      : undefined
  const progressLabel = `${thread.steps.length}/6 steps`
  const advanceLabel =
    thread.steps.length === 0
      ? 'Start'
      : activeStep === 'structured-output'
        ? 'Hold'
        : 'Advance'

  return (
    <section
      className={classNames(['scene scene-nexus is-active', showMismatch && 'has-mismatch'])}
      aria-label="Nexus"
    >
      <div className="canvas-grid" aria-hidden="true" />
      <div className="nexus-flow-layer" aria-label="Nexus orchestration topology">
        <NexusEdgeLayer steps={thread.steps} activeStep={activeStep} />
        {NEXUS_NODES.map((node) => {
          const state = nodeStates[node.id]
          const isActive = state === 'is-active'
          const isSelfReportNode = showMismatch && node.id === 'bill'
          return (
            <button
              key={node.id}
              type="button"
              className={classNames(['flow-node', state])}
              style={nodeStyle(node.id)}
              aria-pressed={isActive}
              onClick={() => {
                if (isActive) runAgent()
              }}
            >
              <span className="flow-kind">{isSelfReportNode ? 'Self-report' : node.kind}</span>
              <h3>{isSelfReportNode ? 'Bill standup status' : node.label}</h3>
              <p>{isSelfReportNode ? MISMATCH.reported : node.detail}</p>
            </button>
          )
        })}
      </div>

      {showMismatch ? <MismatchCard /> : null}

      <section className="nexus-brief">
        <p className="eyebrow">Nexus orchestration</p>
        <h2>The question becomes a coordinated thread.</h2>
        <p>&ldquo;{question}&rdquo;</p>
        <div className="nexus-progress-row" aria-label="Nexus progress">
          <span>{progressLabel}</span>
          <span>{activeStep ? STEP_LABELS[activeStep] : 'Question staged'}</span>
        </div>
      </section>

      <aside className="nexus-inspector" aria-label="Active orchestration step">
        <p className="eyebrow">Current focus</p>
        <h3>{inspectorContent?.title ?? (activeStep ? STEP_LABELS[activeStep] : 'Question staged')}</h3>
        <p>
          {inspectorContent?.body ??
            (activeStep
              ? 'This step is owned by the central result card; the inspector stays quiet.'
              : 'Start the run to let the PM agent pull the first evidence cluster.')}
        </p>
        {inspectorContent ? (
          <div className="artifact-list">
            {inspectorContent.artifacts.map((artifact) => (
              <div key={artifact.label} className="artifact-card">
                <strong>{artifact.label}</strong>
                <span>{artifact.detail}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="nexus-active-list">
            {activeNodes.map((nodeId) => (
              <span key={nodeId}>{NEXUS_NODES.find((node) => node.id === nodeId)?.kind}</span>
            ))}
          </div>
        )}
      </aside>

      <div className="nexus-advance-bar">
        <button type="button" className="nexus-advance" onClick={runAgent}>
          {advanceLabel}
        </button>
      </div>
    </section>
  )
}

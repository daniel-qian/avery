import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import {
  AGENT_OUTPUT,
  HERO_QUESTION,
  HUMAN_LOOP,
  MISMATCH,
  NEXUS_INSPECTOR_CONTENT,
  PEOPLE,
  SIGNALS,
  TIMELINE,
  type Signal,
  type TaskTemplate,
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

const TIMELINE_WHEN_ORDER: Record<string, number> = {
  Thu: 0,
  'Thu pm': 1,
  'Fri am': 2,
  Fri: 3,
  'Next week': 4,
  Tue: 5,
}

const TIMELINE_STATE_COPY: Record<string, { label: string; detail: string }> = {
  replanned: { label: 'Replanned', detail: 'Moved into the trimmed Friday path.' },
  planned: { label: 'Planned', detail: 'Kept in the main Friday path.' },
  held: { label: 'Held', detail: 'Main plan focus: Friday still ships.' },
  deferred: { label: 'Deferred', detail: 'Cut from core scope to protect Friday.' },
  conditional: {
    label: 'Conditional',
    detail: 'Contingency only if Slack rate-limit is not cracked by Thursday.',
  },
}

function taskTemplateKey(task: TaskTemplate) {
  return `${task.title}::${task.assigneeId}::${task.due}`
}

function nameOf(personId: string) {
  return PEOPLE.find((person) => person.id === personId)?.name ?? personId
}

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

function TimelineCard() {
  const milestones = [...TIMELINE.milestones].sort(
    (a, b) => TIMELINE_WHEN_ORDER[a.when] - TIMELINE_WHEN_ORDER[b.when],
  )

  return (
    <section className="timeline-card" aria-label="Tool output: re-baselined timeline">
      <div className="timeline-card-header">
        <div>
          <p className="eyebrow">Tool output</p>
          <h2>{TIMELINE.title}</h2>
        </div>
        <span>Friday protected</span>
      </div>

      <div className="timeline-track" aria-label="Re-baselined milestones">
        {milestones.map((milestone) => {
          const stateCopy = TIMELINE_STATE_COPY[milestone.state]
          return (
            <article
              key={`${milestone.when}-${milestone.label}`}
              className={classNames([
                'timeline-milestone',
                `is-${milestone.state}`,
                milestone.state === 'held' && 'is-focus',
              ])}
            >
              <span className="timeline-when">{milestone.when}</span>
              <div className="timeline-marker" aria-hidden="true" />
              <div className="timeline-body">
                <div className="timeline-title-row">
                  <h3>{milestone.label}</h3>
                  <span>{stateCopy.label}</span>
                </div>
                <p>{stateCopy.detail}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
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

function StructuredOutputCard({
  dispatchedTaskKeys,
  onDispatchTask,
  onReturnDashboard,
}: {
  dispatchedTaskKeys: Set<string>
  onDispatchTask: (template: TaskTemplate) => void
  onReturnDashboard: () => void
}) {
  return (
    <section className="structured-output-card" aria-label="Structured trusted output report">
      <header className="structured-output-header">
        <div>
          <p className="eyebrow">Trusted output</p>
          <h2>Decision report</h2>
        </div>
        <span>Human review ready</span>
      </header>

      <section className="report-section report-conclusion" aria-label="Conclusion">
        <p className="report-section-label">Conclusion</p>
        <strong>{AGENT_OUTPUT.conclusion}</strong>
      </section>

      <div className="report-grid">
        <section className="report-section" aria-label="Evidence">
          <p className="report-section-label">Evidence</p>
          <ol className="report-list">
            {AGENT_OUTPUT.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="report-section" aria-label="Uncertainties">
          <p className="report-section-label">Uncertainties</p>
          <ul className="report-list">
            {AGENT_OUTPUT.uncertainties.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="report-section" aria-label="Recommended actions">
        <p className="report-section-label">Recommended actions</p>
        <ol className="report-list report-actions">
          {AGENT_OUTPUT.recommendedActions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <div className="report-grid report-bottom-grid">
        <section className="report-section" aria-label="Needs confirmation from">
          <p className="report-section-label">Needs confirmation from</p>
          <div className="confirmation-list">
            {AGENT_OUTPUT.needsConfirmationFrom.map((person) => (
              <span key={person}>{person}</span>
            ))}
          </div>
        </section>

        <section className="report-section" aria-label="Next tasks">
          <p className="report-section-label">Next tasks</p>
          <div className="next-task-list">
            {AGENT_OUTPUT.nextTasks.map((task) => {
              const dispatched = dispatchedTaskKeys.has(taskTemplateKey(task))
              return (
                <article key={taskTemplateKey(task)} className="next-task-row">
                  <div>
                    <strong>{task.title}</strong>
                    <span>
                      {nameOf(task.assigneeId)} · due {task.due}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={classNames(['dispatch-task-button', dispatched && 'is-dispatched'])}
                    disabled={dispatched}
                    onClick={() => onDispatchTask(task)}
                  >
                    {dispatched ? 'Dispatched' : 'Dispatch'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      </div>

      <footer className="report-footer">
        <button type="button" className="return-dashboard-button" onClick={onReturnDashboard}>
          Return to dashboard
        </button>
      </footer>
    </section>
  )
}

// P5-02 (ADR-0008)：B7 human-loop 的中央 Chat 卡。与 mismatch/timeline/output 同级，
// 读扩写后的 HUMAN_LOOP fixture，消息逐条渐显（CSS stagger）。不扩 store。
function ChatCard() {
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDraft('')
  }

  return (
    <section className="nexus-chat-card" aria-label="Human loop — chat">
      <header className="nexus-chat-header">
        <div>
          <p className="eyebrow">Human loop · Chat</p>
          <h2>{HUMAN_LOOP.title}</h2>
        </div>
        <span>Bill · PM agent · HR agent</span>
      </header>
      <div className="nexus-chat-log">
        {HUMAN_LOOP.messages.map((message, index) => (
          <article
            key={message.id}
            className={classNames([
              'chat-msg',
              message.speaker === 'You' ? 'is-you' : 'is-room',
              `is-${message.role}`,
              message.agentKind && `is-${message.agentKind}`,
            ])}
            style={{ '--chat-i': index } as CSSProperties}
          >
            <div className="chat-speaker-row">
              <span className="chat-speaker">{message.speaker}</span>
              {message.agentKind ? (
                <span className="chat-agent-badge">{message.agentKind.toUpperCase()} agent</span>
              ) : null}
            </div>
            <p className="chat-text">{message.text}</p>
            {message.reference ? <span className="chat-ref">{message.reference}</span> : null}
          </article>
        ))}
      </div>
      <form className="nexus-chat-composer" aria-label="Reply in human-loop chat" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Confirm, redirect, or ask for more evidence..."
          aria-label="Chat reply draft"
        />
        <button type="submit" aria-label="Send chat reply">
          Send
        </button>
      </form>
    </section>
  )
}

export function NexusScene() {
  const thread = useCanvas((s) => s.thread)
  const tasks = useCanvas((s) => s.tasks)
  const runAgent = useCanvas((s) => s.runAgent)
  const dispatchTask = useCanvas((s) => s.dispatchTask)
  const regenBriefing = useCanvas((s) => s.regenBriefing)
  const goScene = useCanvas((s) => s.goScene)
  const question = thread.question ?? HERO_QUESTION
  const nodeStates = useMemo(() => deriveNexusNodeStates(thread.steps), [thread.steps])
  const activeStep = thread.steps[thread.steps.length - 1]?.kind
  const showMismatch = activeStep === 'cross-check'
  const showTimeline = activeStep === 'timeline'
  const showStructuredOutput = activeStep === 'structured-output'
  const showChat = activeStep === 'human-loop'
  const dispatchedTaskKeys = useMemo(() => new Set(tasks.map(taskTemplateKey)), [tasks])
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
  const returnToDashboard = () => {
    regenBriefing()
    goScene('dashboard')
  }

  return (
    <section
      className={classNames([
        'scene scene-nexus is-active',
        showMismatch && 'has-mismatch',
        showTimeline && 'has-timeline',
        showStructuredOutput && 'has-structured-output',
        showChat && 'has-chat',
      ])}
      aria-label="Nexus"
    >
      <div className="canvas-grid" aria-hidden="true" />
      <div className="nexus-flow-layer" aria-label="Nexus orchestration topology">
        <NexusEdgeLayer steps={thread.steps} activeStep={activeStep} />
        {NEXUS_NODES.map((node) => {
          const state = nodeStates[node.id]
          const isActive = state === 'is-active'
          const isUnrevealed = state === 'is-unrevealed'
          const isSelfReportNode = showMismatch && node.id === 'bill'
          return (
            <button
              key={node.id}
              type="button"
              className={classNames(['flow-node', state])}
              style={nodeStyle(node.id)}
              aria-hidden={isUnrevealed || undefined}
              aria-pressed={isActive}
              tabIndex={isUnrevealed ? -1 : undefined}
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
      {showTimeline ? <TimelineCard /> : null}
      {showStructuredOutput ? (
        <StructuredOutputCard
          dispatchedTaskKeys={dispatchedTaskKeys}
          onDispatchTask={dispatchTask}
          onReturnDashboard={returnToDashboard}
        />
      ) : null}

      {showChat ? <ChatCard /> : null}

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

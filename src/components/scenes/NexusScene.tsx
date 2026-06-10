import { useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import {
  AGENT_OUTPUT,
  HERO_QUESTION,
  HUMAN_LOOP,
  MISMATCH,
  PEOPLE,
  SIGNALS,
  TIMELINE,
  type Signal,
  type TaskTemplate,
} from '../../data/fixtures'
import { CASES, DEFAULT_CASE_ID, type CardAnchor, type CaseDefinition } from '../../data/cases'
import { NEXUS_BOARD, bboxOf, type Pos } from '../../data/board'
import { edgePath } from '../../lib/edges'
import { deriveNexusEdgeState, deriveNexusNodeStates } from '../../lib/nexusFlow'
import { pristineThread, threadPlan, useCanvas, type ThreadStepKind } from '../../store/canvasStore'
import { PanZoomCanvas } from '../PanZoomCanvas'
import { useRailCamera, type CameraTarget, type SafeInsets } from '../../lib/useRailCamera'
import { PixelAvatar } from '../PixelAvatar'

// Nexus 节点的估算半宽/半高（board px），供镜头算包围盒。修订 6：节点压小（矩形 180 宽 /
// 产出圆 196），取圆的外接一半再留点余量。
const NODE_HALF = { w: 100, h: 100 }

// Nexus inset（修订 3）：full-bleed——inspector 降级为右上角落 chrome（非实体右面板），
// 故不再为它留宽 inset；只留薄边清 Topbar / advance-bar。
const NEXUS_INSETS: SafeInsets = { top: 80, right: 28, bottom: 100, left: 28 }

// P6-01 (ADR-0013)：step labels / 拓扑 / Manifest 锚点全部移入 per-case 定义（data/cases.ts），
// 本 scene 改读 active case——bill/acme 是第一个 case，errand cases（P6-05/06）零改 scene 接入。

function classNames(parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// board 绝对坐标（修订 2：world 对象 board px only）。.flow-node 基类带 translate(-50%,-50%)。
function nodeStyle(pos: Pos) {
  return { left: `${pos.x}px`, top: `${pos.y}px` }
}

// Manifest 列卡槽（修订 5）：定位到该拍的列内堆叠锚点；活跃拍的卡高亮、历史卡留存淡显。
function CardSlot({
  anchor,
  isActive,
  children,
}: {
  anchor: CardAnchor | undefined
  isActive: boolean
  children: ReactNode
}) {
  if (!anchor) return <>{children}</>
  return (
    <div
      className={classNames(['nexus-card-slot', isActive && 'is-active'])}
      style={{ left: `${anchor.pos.x}px`, top: `${anchor.pos.y}px` }}
    >
      {children}
    </div>
  )
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

// 人名标签 → Person。chat speaker 用精确名（"Bill" / "You"）；report confirmation 用前导词
// （"Vanessa — Acme scope cut" → "Vanessa"）。agent 名（"PM agent"）取不到 person → 返回 undefined。
function personByName(label: string) {
  const token = label.split(/\s[—(–-]/)[0].trim()
  return PEOPLE.find((person) => person.name === token)
}

const BILL_PERSON = PEOPLE.find((person) => person.id === 'u_bill')

function NexusEdgeLayer({
  caseDef,
  steps,
  activeStep,
}: {
  caseDef: CaseDefinition
  steps: { kind: ThreadStepKind }[]
  activeStep?: ThreadStepKind
}) {
  return (
    <svg
      className="nexus-edge-layer"
      viewBox={`0 0 ${NEXUS_BOARD.width} ${NEXUS_BOARD.height}`}
      aria-hidden="true"
    >
      {caseDef.edges.map((edge) => {
        const state = deriveNexusEdgeState(edge, steps)
        const isCollision = activeStep === 'cross-check' && edge.id === 'evidence-bill'
        return (
          <path
            key={edge.id}
            className={classNames(['nexus-edge-path', state, isCollision && 'is-collision'])}
            d={edgePath(caseDef.pos[edge.from], caseDef.pos[edge.to])}
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
      {/* 修订 6：Manifest 连线——已显形的结果卡从各自的产出圆引出，挂到卡左缘。 */}
      {(Object.keys(caseDef.cardAnchors) as ThreadStepKind[]).map((step) => {
        const anchor = caseDef.cardAnchors[step]
        if (!anchor || !steps.some((s) => s.kind === step)) return null
        const from = caseDef.pos[caseDef.manifestProducers[step] ?? caseDef.manifestNodeId]
        const to = { x: anchor.pos.x - anchor.half.w, y: anchor.pos.y }
        return (
          <path
            key={`manifest-${step}`}
            className={classNames(['nexus-edge-path', 'manifest-edge', activeStep === step && 'is-active'])}
            d={edgePath(from, to)}
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
            {AGENT_OUTPUT.needsConfirmationFrom.map((label) => {
              const person = personByName(label)
              return (
                <span key={label} className="confirmation-chip">
                  {person ? <PixelAvatar person={person} size={20} className="inline-avatar" /> : null}
                  {label}
                </span>
              )
            })}
          </div>
        </section>

        <section className="report-section" aria-label="Next tasks">
          <p className="report-section-label">Next tasks</p>
          <div className="next-task-list">
            {AGENT_OUTPUT.nextTasks.map((task) => {
              const dispatched = dispatchedTaskKeys.has(taskTemplateKey(task))
              const assigneePerson = PEOPLE.find((person) => person.id === task.assigneeId)
              return (
                <article key={taskTemplateKey(task)} className="next-task-row">
                  <div>
                    <strong>{task.title}</strong>
                    <span className="next-task-assignee">
                      {assigneePerson ? (
                        <PixelAvatar person={assigneePerson} size={20} className="inline-avatar" />
                      ) : null}
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

// 人类发言者的像素头像（agent 发言无 person sprite，返回 null 保持文字 badge）。
function ChatAvatar({ role, speaker }: { role: string; speaker: string }) {
  if (role !== 'human') return null
  const person = personByName(speaker)
  return person ? <PixelAvatar person={person} size={24} className="chat-avatar" /> : null
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
              <ChatAvatar role={message.role} speaker={message.speaker} />
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

// 无 thread 时的 Nexus 静息态：hero case 的空 thread（question staged）——与冻结前
// 「初始单 thread 槽位」行为同构；模块级常量保住 zustand selector 的引用稳定。
const FALLBACK_THREAD = pristineThread(DEFAULT_CASE_ID)

export function NexusScene() {
  const activeCaseId = useCanvas((s) => s.activeCaseId) ?? DEFAULT_CASE_ID
  const caseDef = CASES[activeCaseId]
  const thread = useCanvas((s) => s.threads[activeCaseId]) ?? FALLBACK_THREAD
  const tasks = useCanvas((s) => s.tasks)
  const runAgent = useCanvas((s) => s.runAgent)
  const dispatchTask = useCanvas((s) => s.dispatchTask)
  const regenBriefing = useCanvas((s) => s.regenBriefing)
  const goScene = useCanvas((s) => s.goScene)
  const question = thread.question ?? caseDef.question ?? HERO_QUESTION
  const nodeStates = useMemo(
    () => deriveNexusNodeStates(caseDef, thread.steps),
    [caseDef, thread.steps],
  )
  const activeStep = thread.steps[thread.steps.length - 1]?.kind
  // 修订 5：结果卡在 Manifest 列累积——到过的拍永久留存，活跃拍高亮。
  const reached = (kind: ThreadStepKind) => thread.steps.some((s) => s.kind === kind)
  const showMismatch = reached('cross-check')
  const showTimeline = reached('timeline')
  const showStructuredOutput = reached('structured-output')
  const showChat = reached('human-loop')
  const dispatchedTaskKeys = useMemo(() => new Set(tasks.map(taskTemplateKey)), [tasks])
  const manifestProducerIds = useMemo(
    () => new Set(Object.values(caseDef.manifestProducers)),
    [caseDef],
  )
  // 分母 = 主段 + 已追加 follow-up 段的总步数（threadPlan 确定性派生）。
  const progressLabel = `${thread.steps.length}/${threadPlan(thread).length} steps`
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

  // ── rail 派生镜头（ADR-0012 决策 4 + 修订 4）：calm = 全图 fit；step = 飞向「活跃簇 + 结果卡」局部 bbox。──
  const camRef = useRef<ReactZoomPanPinchRef | null>(null)
  const cameraTarget = useMemo<CameraTarget | null>(() => {
    const items: Array<{ pos: Pos; halfW: number; halfH: number }> = []
    if (!activeStep) {
      // 修订 6：calm = fit-width 顶锚可读帧——链 + Manifest 列同框（宽度），链尾出帧靠 pan。
      caseDef.nodes.forEach((n) =>
        items.push({ pos: caseDef.pos[n.id], halfW: NODE_HALF.w, halfH: NODE_HALF.h }),
      )
      for (const anchor of Object.values(caseDef.cardAnchors)) {
        if (!anchor) continue
        items.push({
          pos: { x: anchor.pos.x, y: caseDef.manifestLabelPos.y },
          halfW: anchor.half.w,
          halfH: 0,
        })
      }
      const bbox = bboxOf(items)
      return bbox ? { bbox, mode: 'width-top' } : null
    }
    ;(caseDef.stepNodes[activeStep] ?? []).forEach((id) =>
      items.push({ pos: caseDef.pos[id], halfW: NODE_HALF.w, halfH: NODE_HALF.h }),
    )
    const card = caseDef.cardAnchors[activeStep]
    if (card) items.push({ pos: card.pos, halfW: card.half.w, halfH: card.half.h })
    const bbox = bboxOf(items)
    return bbox ? { bbox } : null
  }, [caseDef, activeStep])

  // depKey 带 caseId：切 thread（P6-02）即重取景；单 case 时与旧行为逐拍一致。
  useRailCamera(camRef, cameraTarget, NEXUS_INSETS, `${caseDef.id}:${activeStep ?? 'calm'}`, {
    maxFitScale: 1.1,
  })

  return (
    <section className="scene scene-nexus is-active" aria-label="Nexus">
      <PanZoomCanvas ref={camRef} board={NEXUS_BOARD}>
        <div className="canvas-grid board-surface" aria-hidden="true" />
        <div className="nexus-flow-layer" aria-label="Nexus orchestration topology">
        <NexusEdgeLayer caseDef={caseDef} steps={thread.steps} activeStep={activeStep} />
        {caseDef.nodes.map((node) => {
          // manifest node（修订 5）恒以 ghost 形态在场——一切产物经此显形，不等末拍才出现。
          const rawState = nodeStates[node.id]
          const state =
            node.id === caseDef.manifestNodeId && rawState === 'is-unrevealed'
              ? 'is-future'
              : rawState
          const isActive = state === 'is-active'
          const isUnrevealed = state === 'is-unrevealed'
          const isSelfReportNode = showMismatch && node.id === 'bill'
          return (
            <button
              key={node.id}
              type="button"
              className={classNames([
                'flow-node',
                state,
                manifestProducerIds.has(node.id) && 'is-manifest-node',
              ])}
              style={nodeStyle(caseDef.pos[node.id])}
              aria-hidden={isUnrevealed || undefined}
              aria-pressed={isActive}
              tabIndex={isUnrevealed ? -1 : undefined}
              onClick={() => {
                if (isActive) runAgent()
              }}
            >
              {node.id === 'bill' && BILL_PERSON ? (
                <PixelAvatar person={BILL_PERSON} size={30} className="flow-node-avatar" />
              ) : null}
              <span className="flow-kind">{isSelfReportNode ? 'Self-report' : node.kind}</span>
              <h3>{isSelfReportNode ? 'Bill standup status' : node.label}</h3>
              <p>{isSelfReportNode ? MISMATCH.reported : node.detail}</p>
            </button>
          )
        })}
      </div>

        {/* Manifest 列标题（world 对象，修订 5）。 */}
        <span
          className="manifest-label"
          aria-hidden="true"
          style={{
            left: `${caseDef.manifestLabelPos.x}px`,
            top: `${caseDef.manifestLabelPos.y}px`,
          }}
        >
          Manifest
        </span>

        {showMismatch ? (
          <CardSlot anchor={caseDef.cardAnchors['cross-check']} isActive={activeStep === 'cross-check'}>
            <MismatchCard />
          </CardSlot>
        ) : null}
        {showChat ? (
          <CardSlot anchor={caseDef.cardAnchors['human-loop']} isActive={activeStep === 'human-loop'}>
            <ChatCard />
          </CardSlot>
        ) : null}
        {showTimeline ? (
          <CardSlot anchor={caseDef.cardAnchors['timeline']} isActive={activeStep === 'timeline'}>
            <TimelineCard />
          </CardSlot>
        ) : null}
        {showStructuredOutput ? (
          <CardSlot
            anchor={caseDef.cardAnchors['structured-output']}
            isActive={activeStep === 'structured-output'}
          >
            <StructuredOutputCard
              dispatchedTaskKeys={dispatchedTaskKeys}
              onDispatchTask={dispatchTask}
              onReturnDashboard={returnToDashboard}
            />
          </CardSlot>
        ) : null}

      </PanZoomCanvas>

      <section className="nexus-brief">
        <p className="eyebrow">Nexus orchestration</p>
        <p>&ldquo;{question}&rdquo;</p>
        <div className="nexus-progress-row" aria-label="Nexus progress">
          <span>{progressLabel}</span>
          <span>{activeStep ? caseDef.stepLabels[activeStep] : 'Question staged'}</span>
        </div>
      </section>

      <div className="nexus-advance-bar">
        <button type="button" className="nexus-advance" onClick={runAgent}>
          {advanceLabel}
        </button>
      </div>
    </section>
  )
}

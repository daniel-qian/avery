import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import {
  AGENT_OUTPUT,
  HERO_QUESTION,
  HUMAN_LOOP,
  MISMATCH,
  PEOPLE,
  SIGNALS,
  TIMELINE,
  type Person,
  type Signal,
  type TaskTemplate,
} from '../../data/fixtures'
import {
  APPLE_POLICY_SCREENSHOT,
  APPLE_POLICY_URL_DISPLAY,
  CASES,
  DEFAULT_CASE_ID,
  type CardAnchor,
  type CaseDefinition,
} from '../../data/cases'
import { NEXUS_BOARD, bboxOf, type Pos } from '../../data/board'
import { edgePath } from '../../lib/edges'
import { deriveNexusEdgeState, deriveNexusNodeStates } from '../../lib/nexusFlow'
import { pristineThread, threadPlan, useCanvas, type ThreadStepKind } from '../../store/canvasStore'
import { PanZoomCanvas } from '../PanZoomCanvas'
import { flyToTarget, useRailCamera, type CameraTarget, type SafeInsets } from '../../lib/useRailCamera'
import { PixelAvatar } from '../PixelAvatar'

// Nexus 节点的估算半宽/半高（board px），供镜头算包围盒。修订 6：节点压小（矩形 180 宽 /
// 产出圆 196），取圆的外接一半再留点余量。
const NODE_HALF = { w: 100, h: 100 }

// Nexus inset（修订 3）：full-bleed——inspector 降级为右上角落 chrome（非实体右面板），
// 故不再为它留宽 inset；只留薄边清 Topbar / advance-bar。
const NEXUS_INSETS: SafeInsets = { top: 80, right: 28, bottom: 100, left: 28 }

// P6-04 (ADR-0013 决策 7)：context-window 安全阈值。demo 数据永不越线（hero follow-up
// 顶到 ~80%）——阈值的存在本身就是叙事（"thread 要守在安全线下"）。进入近阈值带
//（threshold − margin）数字变调 amber：主段收在 71% 仍是常态色，follow-up 80% 进警示带。
const CONTEXT_SAFE_THRESHOLD_PCT = 85
const CONTEXT_NEAR_MARGIN_PCT = 10

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
// P6-03：卡可点——镜头飞向该卡（onInspect = 组件本地镜头命令，不进 store）；卡内
// 交互件（按钮/输入框等）的点击不触发飞行。chip 槽：锚定的 follow-up chip 挂在卡下缘。
function CardSlot({
  anchor,
  isActive,
  onInspect,
  chip,
  children,
}: {
  anchor: CardAnchor | undefined
  isActive: boolean
  onInspect?: () => void
  chip?: ReactNode
  children: ReactNode
}) {
  if (!anchor) return <>{children}</>
  const handleClick = onInspect
    ? (event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        if (target.closest('button, input, textarea, select, a, label')) return
        onInspect()
      }
    : undefined
  return (
    <div
      className={classNames(['nexus-card-slot', isActive && 'is-active', onInspect && 'is-inspectable'])}
      style={{ left: `${anchor.pos.x}px`, top: `${anchor.pos.y}px` }}
      onClick={handleClick}
    >
      {children}
      {chip}
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

// P6-03 (ADR-0013 决策 5)：bill/acme follow-up 段的 Manifest 卡——Jason 替代人选分析。
// 候选人与余量实时引用 PEOPLE fixture（capacityPct 取数，不复制数字）；定性 copy 为
// demo fixture 文案。bill/acme 不加新节点——卡从 output 产出圆显形（cases.ts 已配锚点）。
const ALTERNATIVE_CANDIDATES: Array<{
  personId: string
  skillMatch: string
  risk: string
  riskLevel: 'low' | 'medium' | 'high'
}> = [
  // ⚠ 待 Danny 审字（skillMatch / risk 整组 copy）
  {
    personId: 'u_fred',
    skillMatch: 'Owns the data ingestion path — closest overlap with the Connector interrupts.',
    risk: 'Low — clean signal picture this week.',
    riskLevel: 'low',
  },
  {
    personId: 'u_nasim',
    skillMatch: 'Comfortable across the backend, but no Slack/GitHub connector context yet.',
    risk: 'Medium — mid-sprint on model evaluation.',
    riskLevel: 'medium',
  },
  {
    personId: 'u_aidy',
    skillMatch: 'Knows the test surface, not the ingestion internals.',
    risk: 'High — QA load spikes near the Friday ship.',
    riskLevel: 'high',
  },
]

function AlternativesCard({ question }: { question: string }) {
  return (
    <section className="alternatives-card" aria-label="Follow-up output: alternatives for Jason">
      <header className="alternatives-header">
        <div>
          <p className="eyebrow">Follow-up · Alternatives {/* ⚠ 待 Danny 审字 */}</p>
          <h2>Who else can absorb Bill&rsquo;s interrupts? {/* ⚠ 待 Danny 审字 */}</h2>
        </div>
        <span>PM agent re-check {/* ⚠ 待 Danny 审字 */}</span>
      </header>

      <p className="alternatives-question">&ldquo;{question}&rdquo;</p>

      <div className="alternatives-list">
        {ALTERNATIVE_CANDIDATES.map((candidate) => {
          const person = PEOPLE.find((p) => p.id === candidate.personId)
          if (!person) return null
          return (
            <article key={candidate.personId} className={`alternatives-row is-risk-${candidate.riskLevel}`}>
              <div className="alternatives-person">
                <PixelAvatar person={person} size={26} className="inline-avatar" />
                <div>
                  <strong>{person.name}</strong>
                  <span>{person.role}</span>
                </div>
              </div>
              <span className="alternatives-load">{person.capacityPct}% load {/* ⚠ 待 Danny 审字 */}</span>
              <p className="alternatives-skill">{candidate.skillMatch}</p>
              <p className="alternatives-risk">{candidate.risk}</p>
            </article>
          )
        })}
      </div>

      <p className="alternatives-verdict">
        {/* ⚠ 待 Danny 审字 */}
        Fred is the strongest alternative if Jason takes the new job — Jason still carries the
        cleanest margin. Either way, keep the swap to ≤ 2 days to protect the Friday ship.
      </p>
    </section>
  )
}

// ── P6-05 (ADR-0013 决策 3)：web-search errand case 的 Manifest 卡组 ──────────────
// ① 浏览器预览卡：迷你浏览器窗——URL 栏显示真实 developer.apple.com 地址 + padlock，
// 卡内可滚动看 Apple App Review guidelines 页高清长图。fixture 截图（public/ 资产），
// 非 live iframe（Apple 发 X-Frame-Options/CSP 拒绝被框 + 会场断网风险）；零运行时网络依赖。
function WebPreviewCard() {
  return (
    <section className="browser-preview-card" aria-label="Web tool output: page preview">
      <div className="browser-chrome-bar">
        <span className="browser-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="browser-url-bar">
          <svg
            className="browser-padlock"
            viewBox="0 0 10 12"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="1" y="5" width="8" height="6" rx="1.4" fill="currentColor" />
            <path
              d="M3 5V3.6a2 2 0 1 1 4 0V5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          {APPLE_POLICY_URL_DISPLAY}
        </span>
      </div>
      <div className="browser-viewport" aria-label="App Review Guidelines page (scrollable capture)">
        <img
          className="browser-screenshot"
          src={APPLE_POLICY_SCREENSHOT}
          alt="Apple App Review Guidelines — developer.apple.com page capture"
          loading="lazy"
          draggable={false}
        />
      </div>
    </section>
  )
}

// ② policy gist 卡：agent 的实际回答——guideline 要点引文 + 回链 URL 引用
//（是 agent 不是搜索引擎的证据）。fixture copy 摘自 Apple 官方口径（演示用转述）。
const POLICY_GIST_POINTS: Array<{ point: string; quote: string; ref: string }> = [
  // ⚠ 待 Danny 审字（point / quote 整组 copy）
  {
    point: 'Expedited review exists, but only for extenuating circumstances.',
    quote:
      'You can request an expedited review to fix a critical bug or to release your app ahead of an event you are directly associated with.',
    ref: 'developer.apple.com/contact/app-store/?topic=expedite',
  },
  {
    point: 'The standard queue is already fast — plan for it first.',
    quote: 'On average, 90% of submissions are reviewed in less than 24 hours.',
    ref: 'developer.apple.com/distribute/app-review/',
  },
  {
    point: 'The build must be complete before any review, expedited or not.',
    quote:
      'Submissions should be final versions with all necessary metadata — placeholder content or obvious bugs are rejected under Guideline 2.1.',
    ref: 'developer.apple.com/app-store/review/guidelines/#app-completeness',
  },
]

function PolicyGistCard() {
  return (
    <section className="policy-gist-card" aria-label="Agent answer: Apple policy gist">
      <header className="policy-gist-header">
        <div>
          <p className="eyebrow">Agent answer · Policy gist {/* ⚠ 待 Danny 审字 */}</p>
          <h2>Expedited App Review — the short version {/* ⚠ 待 Danny 审字 */}</h2>
        </div>
        <span>Sources cited {/* ⚠ 待 Danny 审字 */}</span>
      </header>

      <div className="policy-gist-list">
        {POLICY_GIST_POINTS.map((item) => (
          <article key={item.ref} className="policy-gist-row">
            <strong>{item.point}</strong>
            <p className="policy-gist-quote">&ldquo;{item.quote}&rdquo;</p>
            <span className="policy-gist-ref">{item.ref}</span>
          </article>
        ))}
      </div>

      <p className="policy-gist-verdict">
        {/* ⚠ 待 Danny 审字 */}
        For the Acme companion launch: submit a final build through the normal queue now, and
        file the expedited request citing the pilot launch date — Apple grants these on a
        limited, case-by-case basis.
      </p>
    </section>
  )
}

// ③ follow-up 合规判定卡：2–3 bullet 结论 + guideline 引用（短 Manifest，决策 3）。
const COMPLIANCE_CHECKS: Array<{
  verdict: string
  guideline: string
  status: 'pass' | 'attention'
}> = [
  // ⚠ 待 Danny 审字（verdict 整组 copy）
  {
    verdict: 'Release candidate is final — no placeholder content, no known crashes.',
    guideline: 'Guideline 2.1 — App Completeness',
    status: 'pass',
  },
  {
    verdict: 'Privacy labels are stale: the new analytics SDK is not declared yet.',
    guideline: 'Guideline 5.1.1 — Data Collection and Storage',
    status: 'attention',
  },
  {
    verdict: 'Expedited request is justifiable — the Acme pilot launch is a dated event.',
    guideline: 'Expedited review criteria',
    status: 'pass',
  },
]

function ComplianceCard({ question }: { question: string }) {
  return (
    <section className="compliance-card" aria-label="Follow-up output: compliance check">
      <header className="compliance-header">
        <div>
          <p className="eyebrow">Follow-up · Compliance check {/* ⚠ 待 Danny 审字 */}</p>
          <h2>Does the Acme companion build comply? {/* ⚠ 待 Danny 审字 */}</h2>
        </div>
        <span>Against cited guidelines {/* ⚠ 待 Danny 审字 */}</span>
      </header>

      {question ? <p className="compliance-question">&ldquo;{question}&rdquo;</p> : null}

      <div className="compliance-list">
        {COMPLIANCE_CHECKS.map((check) => (
          <article key={check.guideline} className={`compliance-row is-${check.status}`}>
            <span className="compliance-status" aria-hidden="true">
              {check.status === 'pass' ? '✓' : '!'}
            </span>
            <div>
              <p>{check.verdict}</p>
              <span className="compliance-guideline">{check.guideline}</span>
            </div>
          </article>
        ))}
      </div>

      <p className="compliance-verdict">
        {/* ⚠ 待 Danny 审字 */}
        Fix the privacy labels, then submit — everything else is ready for an expedited request.
      </p>
    </section>
  )
}

// ── P6-06 (ADR-0013 决策 4)：email errand case 的 Manifest 卡组 ──────────────────
// 收件人实时派生自 PEOPLE fixture（team === 'Eng' 共 6 人）——不复制名单；
// 地址 = name.lastInitial@company（如 bill.h@teammaster.io），fixture 口径。
const ENG_RECIPIENTS = PEOPLE.filter((person) => person.team === 'Eng')
const EMAIL_DOMAIN = 'teammaster.io' // ⚠ 待 Danny 审字（演示用公司域名）

function emailAddressOf(person: Person) {
  const last = person.lastInitial ? `.${person.lastInitial.toLowerCase()}` : ''
  return `${person.name.toLowerCase()}${last}@${EMAIL_DOMAIN}`
}

// agent 预填的邮件草稿（fixture copy，呼应 memo 占位照片上的要点）。
const EMAIL_SUBJECT = 'Friday ship: code freeze + Acme support rotation' // ⚠ 待 Danny 审字
// ⚠ 待 Danny 审字（草稿 body 整段 copy）
const EMAIL_DRAFT_BODY = `Team,

Two changes for the Acme pilot ship this Friday:

1. Code freeze starts Thursday 6pm — only Friday-path fixes go in after that.
2. Acme support pings now route to the on-call rotation, not directly to Bill.

If either of these blocks you, raise it in #eng before Thursday standup.

Thanks,
Danny`

// Manifest ①：可编辑草稿卡。编辑是**组件本地态**（NexusScene 持有，store 零额外字段）——
// 不入 rail replay（ADR-0006 决策 5 口径）；编辑实时流入 ② email-tool 卡的 body。
function MemoDraftCard({ body, onChange }: { body: string; onChange: (text: string) => void }) {
  return (
    <section className="memo-draft-card" aria-label="Agent draft: editable email text">
      <header className="memo-draft-header">
        <div>
          <p className="eyebrow">Agent draft · Editable {/* ⚠ 待 Danny 审字 */}</p>
          <h2>Memo, turned into an email {/* ⚠ 待 Danny 审字 */}</h2>
        </div>
        <span>From the memo photo {/* ⚠ 待 Danny 审字 */}</span>
      </header>
      <textarea
        className="memo-draft-textarea"
        value={body}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Editable email draft"
        spellCheck={false}
      />
      <p className="memo-draft-hint">
        Edit anything — changes flow straight into the email below. {/* ⚠ 待 Danny 审字 */}
      </p>
    </section>
  )
}

// Manifest ②：email-tool 卡。To: 全部 Eng 6 人（PEOPLE 派生）、subject/body 已填、
// Send 待命。点 Send → sendEmail()（store action，dedupe-guarded）→ 卡翻 "Sent ✓"。
// ★ Send 不进 rail SCRIPT（同 dispatchTask 先例，ADR-0006 决策 5）：现场 Danny 亲手点，
// "人扣扳机"必须可见是人的手；rail seek 重置已点状态（replay 不含 sendEmail），接受。
function EmailToolCard({ body, sent, onSend }: { body: string; sent: boolean; onSend: () => void }) {
  return (
    <section className="email-tool-card" aria-label="Email tool: staged message awaiting Send">
      <header className="email-tool-header">
        <div>
          <p className="eyebrow">Email tool {/* ⚠ 待 Danny 审字 */}</p>
          <h2>Ready to send {/* ⚠ 待 Danny 审字 */}</h2>
        </div>
        <span className={classNames(['email-tool-status', sent && 'is-sent'])}>
          {/* ⚠ 待 Danny 审字（Staged/Sent badge 文案） */}
          {sent ? 'Sent' : 'Staged'}
        </span>
      </header>

      <div className="email-field">
        <span className="email-field-label">To</span>
        <div className="email-recipient-list">
          {ENG_RECIPIENTS.map((person) => (
            <span key={person.id} className="email-recipient-chip">
              <PixelAvatar person={person} size={20} className="inline-avatar" />
              {person.name}
              <i className="email-recipient-address">{emailAddressOf(person)}</i>
            </span>
          ))}
        </div>
      </div>

      <div className="email-field">
        <span className="email-field-label">Subject</span>
        <p className="email-subject">{EMAIL_SUBJECT}</p>
      </div>

      <div className="email-field is-body">
        <span className="email-field-label">Body</span>
        <p className="email-body">{body}</p>
      </div>

      <footer className="email-tool-footer">
        <button
          type="button"
          className={classNames(['email-send-button', sent && 'is-sent'])}
          disabled={sent}
          onClick={onSend}
        >
          {/* ⚠ 待 Danny 审字（Send / Sent ✓ 按钮文案） */}
          {sent ? `Sent ✓ to ${ENG_RECIPIENTS.length} people` : 'Send'}
        </button>
      </footer>
    </section>
  )
}

// follow-up：Slack-message 小 Manifest——短版发 #eng（决策 4；chip 锚在 email-tool 卡）。
const SLACK_SHORT_VERSION = // ⚠ 待 Danny 审字（Slack 短版整段 copy）
  "Heads-up for Friday's Acme pilot ship — code freeze Thursday 6pm, and Acme support now goes to the on-call rotation (not straight to Bill). Full details in the email just sent to Engineering."

function SlackMessageCard({ question }: { question: string }) {
  return (
    <section className="slack-message-card" aria-label="Follow-up output: Slack message to #eng">
      <header className="slack-message-header">
        <div>
          <p className="eyebrow">Follow-up · Slack {/* ⚠ 待 Danny 审字 */}</p>
          <h2>Short version for #eng {/* ⚠ 待 Danny 审字 */}</h2>
        </div>
        <span>#eng {/* ⚠ 待 Danny 审字 */}</span>
      </header>

      {question ? <p className="slack-message-question">&ldquo;{question}&rdquo;</p> : null}

      <div className="slack-message-bubble">
        <span className="slack-message-author">
          TeamMaster agent <i>APP</i> {/* ⚠ 待 Danny 审字 */}
        </span>
        <p>{SLACK_SHORT_VERSION}</p>
      </div>
    </section>
  )
}

// P6-03：常驻自由文本 follow-up composer（HUD，bottom-left）。任意文本被接受、作为显示的
// follow-up 问题、走 active case 的脚本段——与 B3 askQuestion 同构（ADR-0001 demo-only 诚实）。
// 注意：不复用 .nexus-empty-composer（那是空态专用、走 askQuestion 会重置 thread）。
function FollowUpComposer({ onAsk }: { onAsk: (text: string) => void }) {
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    onAsk(text)
    setDraft('')
  }

  return (
    <form className="nexus-followup-composer" aria-label="Ask a follow-up" onSubmit={handleSubmit}>
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Ask a follow-up on this thread..." /* ⚠ 待 Danny 审字 */
        aria-label="Follow-up question"
      />
      <button type="submit">Ask {/* ⚠ 待 Danny 审字 */}</button>
    </form>
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

// P6-02 (ADR-0013 决策 6)：thread chrome——Nexus HUD 的 tab strip + history popover。
// 只在 Nexus（Dashboard 是平静观察面，thread 管理是行动面家具）；viewport-fixed HUD，
// 不进画板（ADR-0012 world/HUD 分层）。全部经核心 action（openThread / closeThread）——
// free-click 可达、rail 可脚本（P6-07）。popover 开合 = 组件本地态，不进 store。
// 不预置装饰性假历史：tab/列表只显示真实存在的 thread（Record 插入序 = 创建时序）。
function ThreadChrome() {
  const threads = useCanvas((s) => s.threads)
  const activeCaseId = useCanvas((s) => s.activeCaseId)
  const openThread = useCanvas((s) => s.openThread)
  const closeThread = useCanvas((s) => s.closeThread)
  const [historyOpen, setHistoryOpen] = useState(false)

  const threadList = Object.values(threads)
  if (threadList.length === 0) return null
  const openThreads = threadList.filter((t) => t.isOpen)

  return (
    <div className="nexus-thread-chrome" aria-label="Nexus threads">
      <div className="nexus-tab-strip" role="tablist" aria-label="Open threads">
        {openThreads.map((t) => {
          const def = CASES[t.caseId]
          const isActiveTab = t.caseId === activeCaseId
          const title = def?.title ?? t.caseId
          return (
            <div
              key={t.caseId}
              className={classNames(['nexus-thread-tab', isActiveTab && 'is-active'])}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActiveTab}
                className="nexus-thread-tab-label"
                onClick={() => openThread(t.caseId)}
              >
                {title}
              </button>
              <button
                type="button"
                className="nexus-thread-tab-close"
                aria-label={`Close thread: ${title}`}
                onClick={() => closeThread(t.caseId)}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      <div className="nexus-history">
        <button
          type="button"
          className={classNames(['nexus-history-toggle', historyOpen && 'is-open'])}
          aria-expanded={historyOpen}
          aria-haspopup="menu"
          onClick={() => setHistoryOpen((open) => !open)}
        >
          History {/* ⚠ 待 Danny 审字 */}
        </button>
        {historyOpen ? (
          <div className="nexus-history-popover" role="menu" aria-label="Thread history">
            <p className="eyebrow">Threads {/* ⚠ 待 Danny 审字 */}</p>
            {threadList.map((t) => {
              const def = CASES[t.caseId]
              return (
                <button
                  key={t.caseId}
                  type="button"
                  role="menuitem"
                  className={classNames(['nexus-history-item', !t.isOpen && 'is-closed'])}
                  onClick={() => {
                    openThread(t.caseId)
                    setHistoryOpen(false)
                  }}
                >
                  <span className="nexus-history-item-title">{def?.title ?? t.caseId}</span>
                  {t.question ? (
                    <span className="nexus-history-item-question">{t.question}</span>
                  ) : null}
                  <span className="nexus-history-item-meta">
                    {/* ⚠ 待 Danny 审字（Open/Closed badge 文案） */}
                    {t.steps.length}/{threadPlan(t).length} steps · {t.isOpen ? 'Open' : 'Closed'}
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// P6-02：Nexus 空态（activeCaseId === null——尚无 thread 或全部关闭）。composer 待命：
// 自由文本走 askQuestion（case-aware，与 B3 同构）；case 建议 chip 走 openThread（已存在
// 的关闭 thread 经此重开、状态完整恢复——保住「直接进 Nexus 起 hero case」的 free-click 路径）。
function NexusEmptyState() {
  const askQuestion = useCanvas((s) => s.askQuestion)
  const openThread = useCanvas((s) => s.openThread)
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    askQuestion(text)
    setDraft('')
  }

  return (
    <section className="nexus-empty" aria-label="Nexus — no open threads">
      <p className="eyebrow">Nexus</p>
      <h2>No open threads {/* ⚠ 待 Danny 审字 */}</h2>
      <p>
        Ask anything to start a new thread, or reopen one from History.{' '}
        {/* ⚠ 待 Danny 审字 */}
      </p>
      <form className="nexus-empty-composer" aria-label="Start a new thread" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask your team anything..." /* ⚠ 待 Danny 审字 */
          aria-label="New thread question"
        />
        <button type="submit">Ask {/* ⚠ 待 Danny 审字 */}</button>
      </form>
      <div className="nexus-empty-suggestions" aria-label="Suggested threads">
        {Object.values(CASES).map((caseDef) => (
          <button
            key={caseDef.id}
            type="button"
            className="nexus-empty-suggestion"
            onClick={() => openThread(caseDef.id)}
          >
            {caseDef.title}
          </button>
        ))}
      </div>
    </section>
  )
}

export function NexusScene() {
  // null = 尚无 thread 或全部关闭 → 空态（composer 待命）；非空走 active case 渲染。
  // caseDef 仍 fallback 到 hero case——保持 hooks 无条件调用，空态下只是不渲染 world 内容。
  const rawActiveCaseId = useCanvas((s) => s.activeCaseId)
  const isEmpty = rawActiveCaseId === null
  const activeCaseId = rawActiveCaseId ?? DEFAULT_CASE_ID
  const caseDef = CASES[activeCaseId]
  const thread = useCanvas((s) => s.threads[activeCaseId]) ?? FALLBACK_THREAD
  const tasks = useCanvas((s) => s.tasks)
  const runAgent = useCanvas((s) => s.runAgent)
  const askFollowUp = useCanvas((s) => s.askFollowUp)
  const dispatchTask = useCanvas((s) => s.dispatchTask)
  const sendEmail = useCanvas((s) => s.sendEmail)
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
  const showAlternatives = reached('follow-up-alternatives')
  // P6-05：web-search errand case 的卡显形条件（步骤 kind 只存在于该 case 的 thread——
  // bill/acme thread 永远 reached() === false，零串扰）。
  const showWebPreview = reached('web-search')
  const showPolicyGist = reached('policy-gist')
  const showCompliance = reached('follow-up-compliance')
  // P6-06：email errand case 的卡显形条件（kind 只存在于该 case 的 thread，零串扰）。
  const showMemoDraft = reached('memo-draft')
  const showEmailTool = reached('email-ready')
  const showSlackMessage = reached('follow-up-slack')
  // P6-06：草稿编辑 = 组件本地态（store 零额外字段，ADR-0006 决策 5）。null = 未编辑
  //（用 agent 预填 fixture）。不入 replay；切 thread / 重挂载丢编辑——issue 接受口径。
  const [memoDraftEdit, setMemoDraftEdit] = useState<string | null>(null)
  const emailBody = memoDraftEdit ?? EMAIL_DRAFT_BODY
  const dispatchedTaskKeys = useMemo(() => new Set(tasks.map(taskTemplateKey)), [tasks])
  const manifestProducerIds = useMemo(
    () => new Set(Object.values(caseDef.manifestProducers)),
    [caseDef],
  )
  // P6-04 (ADR-0013 决策 7)：context-window HUD——数值纯派生自 steps.length × active case
  // 数据，store 零新增字段，seek 任意位置自洽。% = 最新一步的脚本化 stepContextPct
  //（0 步 = 0%，question staged 尚未消耗）；Step 分母 = 主段 + 已追加 follow-up 段总步数
  //（threadPlan 确定性派生）。每 thread 独立：切 tab（P6-02）thread/caseDef 都换，数字跟着换。
  const planLength = threadPlan(thread).length
  const contextPct = activeStep ? (caseDef.stepContextPct[activeStep] ?? 0) : 0
  const isNearContextLimit = contextPct >= CONTEXT_SAFE_THRESHOLD_PCT - CONTEXT_NEAR_MARGIN_PCT
  // P6-05：末态判定泛化为「编排表走完」（原 hard-code structured-output 只对 hero 成立；
  // errand case 末步不同。askFollowUp 延长 planLength → 标签自动回到 Advance）。
  const advanceLabel =
    thread.steps.length === 0 ? 'Start' : thread.steps.length >= planLength ? 'Hold' : 'Advance'
  const returnToDashboard = () => {
    regenBriefing()
    goScene('dashboard')
  }

  // ── rail 派生镜头（ADR-0012 决策 4 + 修订 4）：calm = 全图 fit；step = 飞向「活跃簇 + 结果卡」局部 bbox。──
  const camRef = useRef<ReactZoomPanPinchRef | null>(null)
  const cameraTarget = useMemo<CameraTarget | null>(() => {
    if (isEmpty) return null // 空态不取景；重开 thread 时 depKey 变化触发重取景
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
  }, [caseDef, activeStep, isEmpty])

  // depKey 带 caseId：切 thread（P6-02）即重取景；单 case 时与旧行为逐拍一致。
  // 空态用独立 key——从空态重开同一 thread 也会重取景（key 必然变化）。
  useRailCamera(
    camRef,
    cameraTarget,
    NEXUS_INSETS,
    isEmpty ? 'empty' : `${caseDef.id}:${activeStep ?? 'calm'}`,
    { maxFitScale: 1.1 },
  )

  // ── P6-03 (ADR-0013 决策 5)：Manifest 点击 → 镜头飞向该卡 + follow-up chip 显出。──
  // 镜头/chip 可见性均为组件本地态（store 零额外字段）。inspected 集合按 `${caseId}:${step}`
  // 键——切 thread 不串台；rail seek 不重置它也无妨（chip 只是建议入口，action 才是事实）。
  const [inspectedKeys, setInspectedKeys] = useState<ReadonlySet<string>>(() => new Set())
  const inspectCard = (step: ThreadStepKind) => {
    const anchor = caseDef.cardAnchors[step]
    if (!anchor) return
    const bbox = bboxOf([{ pos: anchor.pos, halfW: anchor.half.w, halfH: anchor.half.h }])
    if (bbox) flyToTarget(camRef.current, { bbox }, NEXUS_INSETS)
    const key = `${caseDef.id}:${step}`
    setInspectedKeys((keys) => {
      if (keys.has(key)) return keys
      const next = new Set(keys)
      next.add(key)
      return next
    })
  }

  // 下一个未消费的 follow-up 段（askFollowUp 第 n 次永远消费第 n 段——确定性）。
  // chip 只出现在该段锚定的卡上，且该卡被点过（镜头飞向过）后才显出。
  const nextFollowUp = caseDef.followUps[thread.followUps.length]
  const chipStep =
    nextFollowUp &&
    reached(nextFollowUp.anchorStep) &&
    inspectedKeys.has(`${caseDef.id}:${nextFollowUp.anchorStep}`)
      ? nextFollowUp.anchorStep
      : null

  // chip / composer 共用出口：追加 follow-up 段（确定性 append）后立即推进一步——
  // 两个都是核心 action，free-click 与 rail 同构（rail P6-07 同序脚本化即可）。
  const handleFollowUp = (text: string) => {
    askFollowUp(text)
    runAgent()
  }

  const followUpChip =
    chipStep && nextFollowUp ? (
      <button
        type="button"
        className="nexus-followup-chip"
        onClick={() => handleFollowUp(nextFollowUp.suggestedQuestion)}
      >
        <span className="nexus-followup-chip-eyebrow">Suggested follow-up {/* ⚠ 待 Danny 审字 */}</span>
        {nextFollowUp.suggestedQuestion}
      </button>
    ) : null

  const latestFollowUp = thread.followUps[thread.followUps.length - 1]
  // follow-up 卡显示「启动它的那次提问」（chip 文本或 composer 自由文本，按 segmentId 回查）。
  const followUpQuestionFor = (step: ThreadStepKind) =>
    thread.followUps.find((f) =>
      caseDef.followUps.find((segment) => segment.id === f.segmentId)?.steps.includes(step),
    )?.question ?? ''
  const alternativesQuestion = followUpQuestionFor('follow-up-alternatives')
  const complianceQuestion = followUpQuestionFor('follow-up-compliance')
  const slackQuestion = followUpQuestionFor('follow-up-slack')

  return (
    <section className="scene scene-nexus is-active" aria-label="Nexus">
      <PanZoomCanvas ref={camRef} board={NEXUS_BOARD}>
        <div className="canvas-grid board-surface" aria-hidden="true" />
        {/* P6-02：空态（无 active thread）不渲染 world 内容——只留画板格栅 + HUD 空态面板。 */}
        {!isEmpty ? (
          <>
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
              {/* P6-06：question 节点的 memo 照片附件 chip（占位资产——Danny 在 P6-08
                  换真照片；路径集中在 cases.ts 的 MEMO_PHOTO_SRC）。 */}
              {node.id === 'question' && caseDef.questionAttachment ? (
                <span className="question-attachment-chip">
                  <img
                    src={caseDef.questionAttachment.src}
                    alt="Attached memo draft photo"
                    draggable={false}
                  />
                  {caseDef.questionAttachment.name}
                </span>
              ) : null}
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
          <CardSlot
            anchor={caseDef.cardAnchors['cross-check']}
            isActive={activeStep === 'cross-check'}
            onInspect={() => inspectCard('cross-check')}
            chip={chipStep === 'cross-check' ? followUpChip : undefined}
          >
            <MismatchCard />
          </CardSlot>
        ) : null}
        {showChat ? (
          <CardSlot
            anchor={caseDef.cardAnchors['human-loop']}
            isActive={activeStep === 'human-loop'}
            onInspect={() => inspectCard('human-loop')}
            chip={chipStep === 'human-loop' ? followUpChip : undefined}
          >
            <ChatCard />
          </CardSlot>
        ) : null}
        {showTimeline ? (
          <CardSlot
            anchor={caseDef.cardAnchors['timeline']}
            isActive={activeStep === 'timeline'}
            onInspect={() => inspectCard('timeline')}
            chip={chipStep === 'timeline' ? followUpChip : undefined}
          >
            <TimelineCard />
          </CardSlot>
        ) : null}
        {showStructuredOutput ? (
          <CardSlot
            anchor={caseDef.cardAnchors['structured-output']}
            isActive={activeStep === 'structured-output'}
            onInspect={() => inspectCard('structured-output')}
            chip={chipStep === 'structured-output' ? followUpChip : undefined}
          >
            <StructuredOutputCard
              dispatchedTaskKeys={dispatchedTaskKeys}
              onDispatchTask={dispatchTask}
              onReturnDashboard={returnToDashboard}
            />
          </CardSlot>
        ) : null}
        {/* P6-03：follow-up 段的新 Manifest 卡——落进 Manifest 列底部（cases.ts 堆叠锚点）。 */}
        {showAlternatives ? (
          <CardSlot
            anchor={caseDef.cardAnchors['follow-up-alternatives']}
            isActive={activeStep === 'follow-up-alternatives'}
            onInspect={() => inspectCard('follow-up-alternatives')}
            chip={chipStep === 'follow-up-alternatives' ? followUpChip : undefined}
          >
            <AlternativesCard question={alternativesQuestion} />
          </CardSlot>
        ) : null}
        {/* P6-05：web-search errand case 的 Manifest 卡组（CardSlot 接法同上）。 */}
        {showWebPreview ? (
          <CardSlot
            anchor={caseDef.cardAnchors['web-search']}
            isActive={activeStep === 'web-search'}
            onInspect={() => inspectCard('web-search')}
            chip={chipStep === 'web-search' ? followUpChip : undefined}
          >
            <WebPreviewCard />
          </CardSlot>
        ) : null}
        {showPolicyGist ? (
          <CardSlot
            anchor={caseDef.cardAnchors['policy-gist']}
            isActive={activeStep === 'policy-gist'}
            onInspect={() => inspectCard('policy-gist')}
            chip={chipStep === 'policy-gist' ? followUpChip : undefined}
          >
            <PolicyGistCard />
          </CardSlot>
        ) : null}
        {showCompliance ? (
          <CardSlot
            anchor={caseDef.cardAnchors['follow-up-compliance']}
            isActive={activeStep === 'follow-up-compliance'}
            onInspect={() => inspectCard('follow-up-compliance')}
            chip={chipStep === 'follow-up-compliance' ? followUpChip : undefined}
          >
            <ComplianceCard question={complianceQuestion} />
          </CardSlot>
        ) : null}
        {/* P6-06：email errand case 的 Manifest 卡组（CardSlot 接法同上）。CardSlot 已
            排除 textarea/button 的点击触发飞行——草稿编辑与 Send 都不会误触镜头。 */}
        {showMemoDraft ? (
          <CardSlot
            anchor={caseDef.cardAnchors['memo-draft']}
            isActive={activeStep === 'memo-draft'}
            onInspect={() => inspectCard('memo-draft')}
            chip={chipStep === 'memo-draft' ? followUpChip : undefined}
          >
            <MemoDraftCard body={emailBody} onChange={setMemoDraftEdit} />
          </CardSlot>
        ) : null}
        {showEmailTool ? (
          <CardSlot
            anchor={caseDef.cardAnchors['email-ready']}
            isActive={activeStep === 'email-ready'}
            onInspect={() => inspectCard('email-ready')}
            chip={chipStep === 'email-ready' ? followUpChip : undefined}
          >
            <EmailToolCard body={emailBody} sent={thread.emailSent} onSend={sendEmail} />
          </CardSlot>
        ) : null}
        {showSlackMessage ? (
          <CardSlot
            anchor={caseDef.cardAnchors['follow-up-slack']}
            isActive={activeStep === 'follow-up-slack'}
            onInspect={() => inspectCard('follow-up-slack')}
            chip={chipStep === 'follow-up-slack' ? followUpChip : undefined}
          >
            <SlackMessageCard question={slackQuestion} />
          </CardSlot>
        ) : null}
          </>
        ) : null}

      </PanZoomCanvas>

      {/* P6-02：thread chrome（tab strip + history popover），viewport-fixed HUD。 */}
      <ThreadChrome />

      {!isEmpty ? (
        <>
          <section className="nexus-brief">
            <p className="eyebrow">Nexus orchestration</p>
            <p>&ldquo;{question}&rdquo;</p>
            {/* P6-03：已追加的最新 follow-up 提问（chip 文本或 composer 自由文本）。 */}
            {latestFollowUp ? (
              <p className="nexus-brief-followup">
                Follow-up: &ldquo;{latestFollowUp.question}&rdquo; {/* ⚠ 待 Danny 审字（前导词） */}
              </p>
            ) : null}
            {/* P6-04：context-window HUD——醒目不低调（讲点不是装饰）。阈值刻度常驻可见、
                近阈值变 amber。原 "x/x steps" chip 被 Step x/x 取代（同一数据源，免重复）。 */}
            <div
              className={classNames(['nexus-context-hud', isNearContextLimit && 'is-near-limit'])}
              aria-label={`Context window ${contextPct}% used · step ${thread.steps.length} of ${planLength} · safe threshold ${CONTEXT_SAFE_THRESHOLD_PCT}%`}
            >
              <p className="nexus-context-readout">
                {/* ⚠ 待 Danny 审字（"Context" / "Step" 词形） */}
                Context {contextPct}% · Step {thread.steps.length}/{planLength}
              </p>
              <div className="nexus-context-meter" aria-hidden="true">
                <span
                  className="nexus-context-meter-fill"
                  style={{ transform: `scaleX(${contextPct / 100})` }}
                />
                <span
                  className="nexus-context-meter-threshold"
                  style={{ left: `${CONTEXT_SAFE_THRESHOLD_PCT}%` }}
                >
                  <span className="nexus-context-threshold-label">
                    {CONTEXT_SAFE_THRESHOLD_PCT}%
                  </span>
                </span>
              </div>
            </div>
            <div className="nexus-progress-row" aria-label="Nexus progress">
              <span>{activeStep ? caseDef.stepLabels[activeStep] : 'Question staged'}</span>
            </div>
          </section>

          <div className="nexus-advance-bar">
            <button type="button" className="nexus-advance" onClick={runAgent}>
              {advanceLabel}
            </button>
          </div>

          {/* P6-03：常驻自由文本 follow-up composer（HUD，bottom-left；不复用空态 composer）。 */}
          <FollowUpComposer onAsk={handleFollowUp} />
        </>
      ) : (
        <NexusEmptyState />
      )}
    </section>
  )
}

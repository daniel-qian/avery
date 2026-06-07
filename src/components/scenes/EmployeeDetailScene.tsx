import { CAPABILITIES, PEOPLE, PROJECTS, type Task } from '../../data/fixtures'
import {
  employeeOverviewFor,
  hrAnalysisFor,
  signalsFor,
  tasksForPerson,
  weeklySummaryFor,
  type DetailPhase,
  type Sentiment,
} from '../../data/fixtures.p3'
import { DetailSection, DetailShell, SourceAnchor } from '../DetailShell'
import { PixelAvatar } from '../PixelAvatar'
import { useCanvas } from '../../store/canvasStore'

// P5-03：员工详情页 state-aware。Nexus 完成前只显 raw facts；B9 后智能层长出。
// 概览卡 / current tasks / weekly summary+sentiment / HR knowledge analysis。
// 故事人四模块全有；texture 人走派生卡 + tasks，缺数据模块走干净空态。

const projectTitleOf = (id: string) => PROJECTS.find((p) => p.id === id)?.title ?? '—'
const capabilityTitleOf = (id: string) => CAPABILITIES.find((c) => c.id === id)?.title ?? id

const TASK_STATUS_LABEL: Record<Task['status'], string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  stalled: 'Stalled',
  done: 'Done',
}

const SENTIMENT_LABEL: Record<Sentiment, string> = {
  positive: 'Positive',
  steady: 'Steady',
  strained: 'Strained',
}

// ⚠ 待 Danny 审字：believed/grown 模块深度标签。
const HR_ANALYSIS_EYEBROW = {
  believed: 'Observed symptoms',
  grown: 'Capabilities-backed',
} satisfies Record<DetailPhase, string>

export function EmployeeDetailScene() {
  const detail = useCanvas((s) => s.detail)
  const isGrown = useCanvas((s) =>
    s.thread.steps.some((step) => step.kind === 'structured-output'),
  )
  const person = PEOPLE.find((p) => p.id === detail?.id)

  if (!person) {
    return (
      <DetailShell ariaLabel="Employee detail" eyebrow="Employee detail" title="Unknown teammate">
        <DetailSection title="Not found" empty="This teammate is no longer on the roster." />
      </DetailShell>
    )
  }

  const phase: DetailPhase = isGrown ? 'grown' : 'believed'
  const overview = employeeOverviewFor(person, phase)
  const tasks = tasksForPerson(person.id, phase)
  const weekly = weeklySummaryFor(person.id, phase)
  const analysis = hrAnalysisFor(person.id, phase)
  const personSignals = signalsFor(person.id, phase)
  const analysisRecommendations = analysis?.recommendations ?? []

  return (
    <DetailShell
      ariaLabel="Employee detail"
      sceneClass="scene-employee"
      eyebrow="Employee detail"
      title={person.name}
      subtitle={`${person.role} · ${person.team}`}
      media={<PixelAvatar person={person} size={56} className="detail-avatar" />}
    >
      {/* 1 · 概览卡：Workload / Status / Progress / HR signal */}
      <section className="overview-card" aria-label="Overview">
        <div className="overview-grid">
          <div className="overview-stat">
            <span className="overview-label">{overview.workloadLabel}</span>
            <strong>{overview.workloadValue}</strong>
          </div>

          <div className="overview-stat">
            <span className="overview-label">Status</span>
            <strong>
              <span className={`status-dot ${isGrown ? 'tone-stable' : 'tone-warning'}`} aria-hidden="true" />
              {overview.statusLabel}
            </strong>
          </div>

          <div className="overview-stat">
            <span className="overview-label">{overview.progressLabel}</span>
            <strong>{overview.progressValue}</strong>
            {person.capacityPct != null ? (
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${Math.min(person.capacityPct, 100)}%` }} />
              </div>
            ) : null}
          </div>

          <div className="overview-stat">
            <span className="overview-label">HR signal</span>
            <strong className={overview.hrSignal ? undefined : 'is-empty'}>
              {overview.hrSignal ?? 'No HR signal — looks steady'}
              <SourceAnchor signals={personSignals} />
            </strong>
          </div>
        </div>
      </section>

      {/* 2 · Current project tasks（TASKS by assignee）*/}
      <DetailSection
        eyebrow="Workload"
        title="Current project tasks"
        empty={tasks.length === 0 ? 'No active tasks right now.' : undefined}
      >
        <div className="task-card-list">
          {tasks.map((task) => (
            <article key={task.id} className={`task-card is-${task.status}`}>
              <strong>{task.title}</strong>
              <span className="task-card-meta">
                <span>{projectTitleOf(task.projectId)}</span>
                <span className="task-status-pill">{TASK_STATUS_LABEL[task.status]}</span>
              </span>
              <p className="phase-note">{task.note}</p>
            </article>
          ))}
        </div>
      </DetailSection>

      {/* 3 · Weekly summary + sentiment */}
      <DetailSection
        eyebrow="This week"
        title="Weekly summary & sentiment"
        empty={weekly ? undefined : 'No weekly summary yet — nothing notable surfaced.'}
      >
        {weekly ? (
          <div className="weekly-block">
            <span className={`sentiment-pill is-${weekly.sentiment}`}>
              {SENTIMENT_LABEL[weekly.sentiment]} · {weekly.sentimentNote}
            </span>
            <p>
              {weekly.text}
              <SourceAnchor signals={personSignals} />
            </p>
          </div>
        ) : null}
      </DetailSection>

      {/* 4 · HR knowledge analysis（capability-backed · no personnel judgment）*/}
      <DetailSection
        eyebrow={HR_ANALYSIS_EYEBROW[phase]}
        title="HR knowledge analysis"
        empty={analysis ? undefined : 'No HR analysis needed — signals look steady.'}
      >
        {analysis ? (
          <div className="hr-analysis">
            {analysis.capabilityId ? (
              <p className="hr-analysis-capability">
                Capability · {capabilityTitleOf(analysis.capabilityId)}
              </p>
            ) : null}
            <p className="hr-analysis-reading">
              {analysis.reading}
              <SourceAnchor signals={personSignals} />
            </p>
            {analysisRecommendations.length > 0 ? (
              <ol className="hr-analysis-recs">
                {analysisRecommendations.map((rec) => (
                  <li key={rec}>
                    {rec}
                    <SourceAnchor signals={personSignals} label="Why" />
                  </li>
                ))}
              </ol>
            ) : null}
            {analysis.framing ? (
              <p className="hr-analysis-framing">
                {analysis.framing}
                <SourceAnchor signals={personSignals} />
              </p>
            ) : null}
          </div>
        ) : null}
      </DetailSection>
    </DetailShell>
  )
}

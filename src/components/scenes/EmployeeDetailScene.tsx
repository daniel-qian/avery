import { CAPABILITIES, PEOPLE, PROJECTS, TASKS, type Task } from '../../data/fixtures'
import {
  deriveStatus,
  hrAnalysisFor,
  hrSignalFor,
  ownedProjectProgress,
  signalsFor,
  weeklySummaryFor,
  type DetailPhase,
  type Sentiment,
} from '../../data/fixtures.p3'
import { DetailSection, DetailShell } from '../DetailShell'
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

  const status = deriveStatus(person.capacityPct)
  const owned = ownedProjectProgress(person.id)
  const phase: DetailPhase = isGrown ? 'grown' : 'believed'
  const hrSignal = hrSignalFor(person.id, phase)
  const tasks = TASKS.filter((task) => task.assigneeId === person.id)
  const weekly = weeklySummaryFor(person.id, phase)
  const analysis = hrAnalysisFor(person.id, phase)
  const personSignals = signalsFor(person.id, phase)

  return (
    <DetailShell
      ariaLabel="Employee detail"
      sceneClass="scene-employee"
      eyebrow="Employee detail"
      title={person.name}
      subtitle={`${person.role} · ${person.team}`}
    >
      {/* 1 · 概览卡：Workload / Status / Progress / HR signal */}
      <section className="overview-card" aria-label="Overview">
        <div className="overview-grid">
          {person.capacityPct != null ? (
            <div className="overview-stat">
              <span className="overview-label">Workload</span>
              <strong>{person.capacityPct}%</strong>
            </div>
          ) : null}

          {status ? (
            <div className="overview-stat">
              <span className="overview-label">Status</span>
              <strong>
                <span className={`status-dot ${status.tone}`} aria-hidden="true" />
                {status.label}
              </strong>
            </div>
          ) : null}

          {owned ? (
            <div className="overview-stat">
              <span className="overview-label">Progress · {owned.project.title}</span>
              <strong>{owned.progress}%</strong>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${owned.progress}%` }} />
              </div>
            </div>
          ) : null}

          {isGrown ? (
            <div className="overview-stat">
              <span className="overview-label">HR signal</span>
              <strong className={hrSignal ? undefined : 'is-empty'}>
                {hrSignal ?? 'No HR signal — looks steady'}
              </strong>
            </div>
          ) : null}
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
            </article>
          ))}
        </div>
      </DetailSection>

      {isGrown ? (
        <>
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
                <p>{weekly.text}</p>
              </div>
            ) : null}
          </DetailSection>

          {/* 4 · HR knowledge analysis（capability-backed · no personnel judgment）*/}
          <DetailSection
            eyebrow="Capabilities-backed"
            title="HR knowledge analysis"
            empty={analysis ? undefined : 'No HR analysis needed — signals look steady.'}
          >
            {analysis ? (
              <div className="hr-analysis">
                <p className="hr-analysis-capability">
                  Capability · {capabilityTitleOf(analysis.capabilityId)}
                </p>
                <p className="hr-analysis-reading">{analysis.reading}</p>
                <ol className="hr-analysis-recs">
                  {analysis.recommendations.map((rec) => (
                    <li key={rec}>{rec}</li>
                  ))}
                </ol>
                {personSignals.length > 0 ? (
                  <div className="hr-analysis-evidence" aria-label="Signals considered">
                    <p className="overview-label">Signals considered</p>
                    {personSignals.map((signal) => (
                      <div key={signal.id} className="hr-evidence-row">
                        <span>{signal.source}</span>
                        <p>{signal.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <p className="hr-analysis-framing">{analysis.framing}</p>
              </div>
            ) : null}
          </DetailSection>
        </>
      ) : null}
    </DetailShell>
  )
}

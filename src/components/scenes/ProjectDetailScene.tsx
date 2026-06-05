import { useState } from 'react'
import { PEOPLE, PROJECTS } from '../../data/fixtures'
import {
  MILESTONE_STATE_COPY,
  TASK_BOARD_COLUMNS,
  handoffsForProject,
  milestoneOrder,
  projectMilestones,
  projectTeam,
  signalsForProject,
  tasksForProject,
  weeklyUpdatesForProject,
  type DetailPhase,
} from '../../data/fixtures.p3'
import { DetailSection, DetailShell } from '../DetailShell'
import { useCanvas } from '../../store/canvasStore'

// P5-03：项目详情页 state-aware。Nexus 完成前只显 raw facts；B9 后智能层长出。
// 主层级：brief / milestones / team / task board / handoffs / weekly updates。
// 次层级（下沉护 reveal）：Risk & HR signal · Evidence。
// 故事项目全模块；texture 项目走派生数据 + 干净空态。复用 DetailShell。

const nameOf = (id: string) => PEOPLE.find((p) => p.id === id)?.name ?? id
const titleOf = (id: string) => PROJECTS.find((p) => p.id === id)?.title ?? id

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function statusTone(status: string) {
  if (status === 'blocked') return 'tone-danger'
  if (status === 'at-risk') return 'tone-warning'
  return ''
}

// ⚠ 待 Danny 审字：grown 态项目状态文案。
const GROWN_STATUS_LABEL: Record<string, string> = {
  p_acme: 'at risk · diagnosed · actions in flight · Friday held',
  p_connector: 'at risk · diagnosed · actions in flight',
}

function statusLabel(projectId: string, status: string, phase: DetailPhase) {
  if (phase === 'grown') return GROWN_STATUS_LABEL[projectId] ?? status.replace('-', ' ')
  return status.replace('-', ' ')
}

type HandoffState = 'open' | 'done' | 'discarded'

export function ProjectDetailScene() {
  const detail = useCanvas((s) => s.detail)
  const askQuestion = useCanvas((s) => s.askQuestion)
  const isGrown = useCanvas((s) =>
    s.thread.steps.some((step) => step.kind === 'structured-output'),
  )
  const project = PROJECTS.find((p) => p.id === detail?.id)
  // handoff checklist = 本地交互（不入 store，符合「不扩 store」铁律）。
  const [handoffState, setHandoffState] = useState<Record<string, HandoffState>>({})

  if (!project) {
    return (
      <DetailShell ariaLabel="Project detail" eyebrow="Project detail" title="Unknown project">
        <DetailSection title="Not found" empty="This project is no longer on the board." />
      </DetailShell>
    )
  }

  const phase: DetailPhase = isGrown ? 'grown' : 'believed'
  const milestones = projectMilestones(project.id, phase)
  const sortedMilestones = milestones
    ? [...milestones].sort((a, b) => milestoneOrder(a.when) - milestoneOrder(b.when))
    : null
  const team = projectTeam(project.id)
  const tasks = tasksForProject(project.id)
  const handoffs = handoffsForProject(project.id, phase)
  const weekly = weeklyUpdatesForProject(project.id, phase)
  const signals = signalsForProject(project.id, phase)

  const setHandoff = (id: string, state: HandoffState) =>
    setHandoffState((prev) => ({ ...prev, [id]: state }))

  return (
    <DetailShell
      ariaLabel="Project detail"
      sceneClass="scene-project"
      eyebrow="Project detail"
      title={project.title}
      subtitle={`${project.status.replace('-', ' ')} · owned by ${nameOf(project.ownerId)}`}
    >
      {/* 1 · Project brief */}
      <section className="brief-card" aria-label="Project brief">
        {project.summary ? <p className="brief-summary">{project.summary}</p> : null}
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${project.progress}%` }} />
        </div>
        <div className="brief-meta">
          <span className={`brief-status ${statusTone(project.status)}`}>
            <span className="status-dot" aria-hidden="true" />
            {statusLabel(project.id, project.status, phase)}
          </span>
          <span>{project.progress}% complete</span>
          {project.dueDate ? <span>Due {project.dueDate}</span> : null}
          {project.dependsOn?.map((depId) => (
            <span key={depId} className="brief-dep">
              Depends on {titleOf(depId)}
            </span>
          ))}
        </div>
      </section>

      {isGrown ? (
        <DetailSection
          eyebrow="Re-baselined"
          title="Delivery milestones"
          empty={sortedMilestones ? undefined : 'No milestone plan yet — nothing scheduled.'}
        >
          {sortedMilestones ? (
            <ol className="milestone-track">
              {sortedMilestones.map((milestone) => {
                const copy = MILESTONE_STATE_COPY[milestone.state] ?? {
                  label: milestone.state,
                  tone: '',
                }
                return (
                  <li key={`${milestone.when}-${milestone.label}`} className={`milestone ${copy.tone}`}>
                    <span className="milestone-when">{milestone.when}</span>
                    <span className="milestone-dot" aria-hidden="true" />
                    <div className="milestone-body">
                      <strong>{milestone.label}</strong>
                      <span className="milestone-state">{copy.label}</span>
                    </div>
                  </li>
                )
              })}
            </ol>
          ) : null}
        </DetailSection>
      ) : null}

      {/* 3 · Team responsibilities */}
      <DetailSection
        eyebrow="Who's on it"
        title="Team responsibilities"
        empty={team.length === 0 ? 'No one assigned yet.' : undefined}
      >
        <div className="team-avatars">
          {team.map(({ person, role }) => (
            <div key={person.id} className="team-member">
              <span className="avatar" aria-hidden="true">
                {initials(person.name)}
              </span>
              <div>
                <strong>{person.name}</strong>
                <span>
                  {role} · {person.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DetailSection>

      {/* 4 · Task board（3 段：Needs decision / In progress / Done or waiting）*/}
      <DetailSection
        eyebrow="Current work"
        title="Task board"
        empty={tasks.length === 0 ? 'No tasks on this project yet.' : undefined}
      >
        <div className="task-board">
          {TASK_BOARD_COLUMNS.map((column) => {
            const columnTasks = tasks.filter((task) => column.statuses.includes(task.status))
            return (
              <div key={column.key} className={`task-column is-${column.key}`}>
                <p className="task-column-head">
                  {column.title} <span>{columnTasks.length}</span>
                </p>
                <div className="task-column-list">
                  {columnTasks.length === 0 ? (
                    <p className="task-column-empty">Nothing here</p>
                  ) : (
                    columnTasks.map((task) => (
                      <article key={task.id} className="board-card">
                        <strong>{task.title}</strong>
                        <span>{nameOf(task.assigneeId)}</span>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DetailSection>

      {isGrown ? (
        <>
          {/* 5 · Handoffs（checklist：done / discard · 部分一键飞回 Nexus）*/}
          <DetailSection
            eyebrow="Ready to act"
            title="Handoffs"
            empty={handoffs.length === 0 ? 'No handoffs — nothing to action right now.' : undefined}
          >
            <div className="handoff-list">
              {handoffs.map((handoff) => {
                const state = handoffState[handoff.id] ?? 'open'
                return (
                  <article key={handoff.id} className={`handoff-card is-${state}`}>
                    <div className="handoff-body">
                      <strong>{handoff.text}</strong>
                      {handoff.detail ? <p>{handoff.detail}</p> : null}
                      {handoff.flyToNexus ? (
                        <button
                          type="button"
                          className="handoff-fly"
                          onClick={() => askQuestion(handoff.flyToNexus as string)}
                        >
                          Dig in via Nexus →
                        </button>
                      ) : null}
                    </div>
                    <div className="handoff-actions">
                      {state === 'open' ? (
                        <>
                          <button
                            type="button"
                            className="handoff-done"
                            onClick={() => setHandoff(handoff.id, 'done')}
                          >
                            Done
                          </button>
                          <button
                            type="button"
                            className="handoff-discard"
                            onClick={() => setHandoff(handoff.id, 'discarded')}
                          >
                            Discard
                          </button>
                        </>
                      ) : (
                        <span className="handoff-tag">
                          {state === 'done' ? 'Done' : 'Discarded'}
                          <button
                            type="button"
                            className="handoff-undo"
                            onClick={() => setHandoff(handoff.id, 'open')}
                          >
                            Undo
                          </button>
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </DetailSection>

          {/* 6 · Weekly team updates */}
          <DetailSection
            eyebrow="This week"
            title="Weekly team updates"
            empty={weekly.length === 0 ? 'No updates logged this week.' : undefined}
          >
            <div className="weekly-update-list">
              {weekly.map((update) => (
                <div key={update.personId} className="weekly-update-row">
                  <strong>{nameOf(update.personId)}</strong>
                  <p>{update.update}</p>
                </div>
              ))}
            </div>
          </DetailSection>

          {/* 次层级（下沉，护 B9b 之前的 reveal）：Risk & HR signal · Evidence */}
          <div className="detail-sublayer" aria-label="Secondary signals">
            <DetailSection
              eyebrow="Secondary"
              title="Risk & HR signal"
              empty={signals.length === 0 ? 'No signals — looks steady.' : undefined}
            >
              <ul className="risk-list">
                {signals.map((signal) => (
                  <li key={signal.id}>
                    {signal.tag ? (
                      <span className="risk-tag">{signal.tag.replace('-', ' ')}</span>
                    ) : null}
                    {signal.summary}
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection
              eyebrow="Source traces"
              title="Evidence"
              empty={signals.length === 0 ? 'No evidence to trace yet.' : undefined}
            >
              <div className="evidence-list">
                {signals.map((signal) => (
                  <div key={signal.id} className="evidence-row">
                    <span>{signal.source}</span>
                    <p>
                      {signal.summary} <em>· {signal.ageDays}d ago</em>
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>
          </div>
        </>
      ) : null}
    </DetailShell>
  )
}

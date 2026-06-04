import { PEOPLE, PROJECTS, BRIEFING_V1 } from '../../data/fixtures'
import { PERSON_POS, PROJECT_POS } from '../../data/layout'
import { SvgEdgeLayer } from '../SvgEdgeLayer'
import { useCanvas } from '../../store/canvasStore'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function statusTone(status: string) {
  if (status === 'blocked') return 'tone-danger'
  if (status === 'at-risk') return 'tone-warning'
  return ''
}

// P0：静态渲染 people orbit + project cards（吃真 fixtures + 布局坐标）+ owner 连线 + 开场 Briefing。
// 点节点 = 钻入 detail（证明 scene 切换 + project→task→employee 数据流通）。
// focus 暗化动画 / composer / alerts 留到 P1。
export function DashboardScene() {
  const openDetail = useCanvas((s) => s.openDetail)
  return (
    <section className="scene scene-dashboard is-active" aria-label="Dashboard">
      <div className="canvas-grid" aria-hidden="true" />
      <SvgEdgeLayer />

      <section className="briefing-layer" aria-label="Executive briefing">
        <p className="eyebrow">Live organization weather</p>
        <h2>{BRIEFING_V1.headline}</h2>
        <p>{BRIEFING_V1.subhead}</p>
        <div className="metric-row" aria-label="Key metrics">
          {BRIEFING_V1.metrics.map((m) => (
            <span key={m.label}>
              <strong>{m.value}</strong> {m.label}
            </span>
          ))}
        </div>
      </section>

      <div className="people-layer" aria-label="People orbit">
        {PEOPLE.map((person) => {
          const pos = PERSON_POS[person.id]
          if (!pos) return null
          return (
            <button
              key={person.id}
              type="button"
              className="person-node tone-stable"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              aria-label={`Open ${person.name}`}
              onClick={() => openDetail('employee', person.id)}
            >
              <span className="avatar" aria-hidden="true">
                {initials(person.name)}
              </span>
              <span>
                <h3>{person.name}</h3>
                <p>{person.role}</p>
              </span>
              <span className="person-stats">
                <span>{person.capacityPct ?? 100}% load</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="project-layer" aria-label="Project layer">
        {PROJECTS.map((project) => {
          const pos = PROJECT_POS[project.id]
          if (!pos) return null
          return (
            <button
              key={project.id}
              type="button"
              className="project-card"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              aria-label={`Open ${project.title}`}
              onClick={() => openDetail('project', project.id)}
            >
              <span className="project-status">
                <span className={`status-dot ${statusTone(project.status)}`} />
                {project.status.replace('-', ' ')}
              </span>
              <h3>{project.title}</h3>
              {project.summary && <p>{project.summary}</p>}
              <div
                className="progress-track"
                aria-label={`${project.progress}% complete`}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="project-meta">
                <span>{project.progress}% complete</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

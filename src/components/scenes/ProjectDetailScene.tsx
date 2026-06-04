import { PROJECTS, TASKS, PEOPLE } from '../../data/fixtures'
import { useCanvas } from '../../store/canvasStore'

const nameOf = (id: string) => PEOPLE.find((p) => p.id === id)?.name ?? 'Unassigned'

// stub —— 内部模块（current tasks / milestone timeline）P3 用 placeholder 填实。
// P0 已证明 Project → 含多个 Task → 分配给 Employee 的数据贯通。
export function ProjectDetailScene() {
  const detail = useCanvas((s) => s.detail)
  const back = useCanvas((s) => s.back)
  const project = PROJECTS.find((p) => p.id === detail?.id)
  const tasks = TASKS.filter((t) => t.projectId === detail?.id)

  return (
    <section className="scene is-active" aria-label="Project detail">
      <section className="nexus-brief">
        <button type="button" className="scene-tab" onClick={back}>
          ← Back
        </button>
        <p className="eyebrow">Project detail · 内部模块 placeholder (P3)</p>
        <h2>{project?.title ?? 'Unknown project'}</h2>
        {project?.summary && <p>{project.summary}</p>}
        <div className="metric-row">
          <span>
            <strong>{project?.progress ?? 0}%</strong> complete
          </span>
          <span>{project?.status}</span>
          <span>
            <strong>{tasks.length}</strong> tasks
          </span>
        </div>

        <div className="artifact-list" style={{ maxWidth: 460 }}>
          {tasks.map((t) => (
            <div key={t.id} className="artifact-card">
              <strong>{t.title}</strong>
              <span>
                {nameOf(t.assigneeId)} · {t.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

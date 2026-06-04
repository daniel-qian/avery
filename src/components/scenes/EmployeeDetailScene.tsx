import { PEOPLE, TASKS, PROJECTS } from '../../data/fixtures'
import { useCanvas } from '../../store/canvasStore'

const projectOf = (id: string) => PROJECTS.find((p) => p.id === id)?.title ?? '—'

// stub —— workload / current tasks / at-risk 信号模块 P3 填实（reality gap 落地到具体人页）。
export function EmployeeDetailScene() {
  const detail = useCanvas((s) => s.detail)
  const back = useCanvas((s) => s.back)
  const person = PEOPLE.find((p) => p.id === detail?.id)
  const tasks = TASKS.filter((t) => t.assigneeId === detail?.id)

  return (
    <section className="scene is-active" aria-label="Employee detail">
      <section className="nexus-brief">
        <button type="button" className="scene-tab" onClick={back}>
          ← Back
        </button>
        <p className="eyebrow">Employee detail · 模块 placeholder (P3)</p>
        <h2>{person?.name ?? 'Unknown'}</h2>
        {person && <p>{person.role}</p>}
        <div className="metric-row">
          <span>
            <strong>{person?.capacityPct ?? 100}%</strong> load
          </span>
          <span>
            <strong>{tasks.length}</strong> active tasks
          </span>
        </div>

        <div className="artifact-list" style={{ maxWidth: 460 }}>
          {tasks.map((t) => (
            <div key={t.id} className="artifact-card">
              <strong>{t.title}</strong>
              <span>
                {projectOf(t.projectId)} · {t.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

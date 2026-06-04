import { CAPABILITIES } from '../../data/fixtures'
import { useCanvas } from '../../store/canvasStore'

// stub —— 护城河展示页（私有 / 订阅 / 自动优先）。P3 做成 sell 向页面。
export function CapabilitiesScene() {
  const back = useCanvas((s) => s.back)
  return (
    <section className="scene is-active" aria-label="Capabilities">
      <section className="nexus-brief">
        <button type="button" className="scene-tab" onClick={back}>
          ← Back
        </button>
        <p className="eyebrow">Capabilities · proprietary · subscription · auto-prioritized</p>
        <h2>The vertical playbooks behind every recommendation.</h2>
        <div className="artifact-list" style={{ maxWidth: 520 }}>
          {CAPABILITIES.map((c) => (
            <div key={c.id} className="artifact-card">
              <strong>
                [{c.domain}] {c.title}
              </strong>
              <span>{c.gist}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

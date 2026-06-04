import { useCanvas, type Scene } from '../store/canvasStore'

// P0 导航：3 个主 scene tab。detail / capabilities 走钻入（P1+）。
const TABS: { label: string; scene: Scene }[] = [
  { label: 'Onboarding', scene: 'onboarding' },
  { label: 'Dashboard', scene: 'dashboard' },
  { label: 'Nexus', scene: 'nexus' },
]

export function Topbar() {
  const scene = useCanvas((s) => s.scene)
  const goScene = useCanvas((s) => s.goScene)
  return (
    <header className="prototype-topbar" aria-label="Prototype controls">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          TM
        </span>
        <div>
          <p className="eyebrow">TeamMaster prototype</p>
          <h1>Ambient command center</h1>
        </div>
      </div>
      <nav className="scene-tabs" aria-label="Scene">
        {TABS.map((t) => (
          <button
            key={t.scene}
            type="button"
            className={`scene-tab${scene === t.scene ? ' is-active' : ''}`}
            onClick={() => goScene(t.scene)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

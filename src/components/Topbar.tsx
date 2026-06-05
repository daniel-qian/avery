import { useCanvas, type Scene } from '../store/canvasStore'

// 导航 scene tab。Capabilities 既经 Nexus 钻入（rail B4 / PM agent 卡按钮），
// 也给个 free-click tab（litmus：每个 beat 自由点击可达）。detail 仍走钻入。
const TABS: { label: string; scene: Scene }[] = [
  { label: 'Onboarding', scene: 'onboarding' },
  { label: 'Dashboard', scene: 'dashboard' },
  { label: 'Nexus', scene: 'nexus' },
  { label: 'Capabilities', scene: 'capabilities' },
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

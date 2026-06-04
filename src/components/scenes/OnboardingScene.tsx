import { ONBOARDING } from '../../data/fixtures'

// stub —— P3 把 prologue 做成动画微流程（解析文件 → agent 分析 → capabilities 点亮）。
export function OnboardingScene() {
  return (
    <section
      className="scene is-active"
      aria-label="Onboarding"
      style={{ display: 'grid', placeItems: 'center', padding: 24 }}
    >
      <div
        className="briefing-layer"
        style={{ position: 'static', transform: 'none', width: 'min(560px, 92vw)' }}
      >
        <p className="eyebrow">Onboarding · prologue (B0)</p>
        <h2>Building the company brain</h2>
        <p>{ONBOARDING.caption}</p>
        <div className="metric-row" aria-label="Sample files">
          {ONBOARDING.sampleFiles.map((f) => (
            <span key={f.name}>{f.name}</span>
          ))}
        </div>
        <div className="metric-row" aria-label="Capabilities matched">
          {ONBOARDING.capabilitiesMatched.map((c) => (
            <span key={c}>
              <strong>auto</strong> {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

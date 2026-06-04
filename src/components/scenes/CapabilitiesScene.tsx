import {
  CAPABILITIES_PAGE,
  CAPABILITY_DOMAIN_LABEL,
  CAPABILITY_DOMAIN_ORDER,
  capabilitiesByDomain,
  loadedCapabilityDomains,
} from '../../data/fixtures.p3'
import { DetailShell } from '../DetailShell'

// P3-04：Capabilities sell 页 = 产品页 + moat banner（register B）。
// 静态恒显（ADR-0005，零 thread 耦合，不按"agent 刚引用了哪条"高亮）。
// 视觉沿用其余 scene 语汇（复用 DetailShell），让"agent 自动引用"的产品内因果不断。
export function CapabilitiesScene() {
  const groups = capabilitiesByDomain()
  const loaded = loadedCapabilityDomains()

  return (
    <DetailShell
      ariaLabel="Capabilities"
      sceneClass="scene-capabilities"
      eyebrow={CAPABILITIES_PAGE.eyebrow}
      title={CAPABILITIES_PAGE.title}
      subtitle={CAPABILITIES_PAGE.framing}
    >
      {/* moat banner：proprietary · subscription · auto-cited */}
      <section className="moat-banner" aria-label="Why Capabilities are the moat">
        {CAPABILITIES_PAGE.moatPoints.map((point) => (
          <span key={point} className="moat-point">
            {point}
          </span>
        ))}
      </section>

      {/* 库覆盖的垂直域（CONTEXT：HR / Legal / PM / Finance / Ops / Sales）*/}
      <section className="capability-coverage" aria-label="Library coverage">
        <p className="eyebrow">Library coverage</p>
        <div className="coverage-strip">
          {CAPABILITY_DOMAIN_ORDER.map((domain) => {
            const isLoaded = loaded.has(domain)
            return (
              <span
                key={domain}
                className={`coverage-chip${isLoaded ? ' is-loaded' : ''}`}
              >
                {CAPABILITY_DOMAIN_LABEL[domain] ?? domain}
                {isLoaded ? <em>loaded</em> : null}
              </span>
            )
          })}
        </div>
      </section>

      {/* CAPABILITIES 按 domain 分组，每卡 title + gist + badge */}
      {groups.map((group) => (
        <section key={group.domain} className="capability-group" aria-label={group.label}>
          <div className="detail-section-head">
            <p className="eyebrow">{group.label}</p>
            <h3>{group.label} playbooks</h3>
          </div>
          <div className="capability-grid">
            {group.entries.map((entry) => (
              <article key={entry.id} className="capability-card">
                <div className="capability-badges">
                  <span className="cap-badge is-proprietary">Proprietary</span>
                  <span className="cap-badge is-cited">Auto-cited</span>
                </div>
                <strong>{entry.title}</strong>
                <p>{entry.gist}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </DetailShell>
  )
}

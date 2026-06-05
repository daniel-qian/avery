import { useState } from 'react'
import {
  CAPABILITY_PACKAGES,
  CAPABILITY_SUBSCRIPTION_COPY,
  CAPABILITIES_PAGE,
  CAPABILITY_DOMAIN_LABEL,
  CAPABILITY_DOMAIN_ORDER,
  type CapabilityPackage,
  loadedCapabilityDomains,
} from '../../data/fixtures.p3'
import { DetailShell } from '../DetailShell'

// P3-04：Capabilities sell 页 = 产品页 + moat banner（register B）。
// 静态恒显（ADR-0005，零 thread 耦合，不按"agent 刚引用了哪条"高亮）。
// 视觉沿用其余 scene 语汇（复用 DetailShell），让"agent 自动引用"的产品内因果不断。
export function CapabilitiesScene() {
  const [subscribedDomains, setSubscribedDomains] = useState<Set<string>>(
    () => loadedCapabilityDomains(),
  )

  const subscribe = (domain: string) => {
    setSubscribedDomains((current) => {
      const next = new Set(current)
      next.add(domain)
      return next
    })
  }

  const unsubscribe = (domain: string) => {
    setSubscribedDomains((current) => {
      const next = new Set(current)
      next.delete(domain)
      return next
    })
  }

  const subscribedPackages = CAPABILITY_PACKAGES.filter((pack) =>
    subscribedDomains.has(pack.domain),
  )
  const availablePackages = CAPABILITY_PACKAGES.filter(
    (pack) => !subscribedDomains.has(pack.domain),
  )

  const packageCard = (pack: CapabilityPackage, isSubscribed: boolean) => (
    <article
      key={pack.domain}
      className={`capability-card capability-package-card${
        isSubscribed ? ' is-subscribed' : ' is-available'
      }`}
    >
      <div className="capability-package-head">
        <div>
          <span className="capability-domain-kicker">Capability pack</span>
          <h4>{pack.title}</h4>
        </div>
        <span className={`cap-badge ${isSubscribed ? 'is-subscribed' : 'is-available'}`}>
          {isSubscribed
            ? CAPABILITY_SUBSCRIPTION_COPY.subscribedBadge
            : CAPABILITY_SUBSCRIPTION_COPY.availableBadge}
        </span>
      </div>
      <p>{pack.gist}</p>
      <div className="capability-preview">
        <span>{CAPABILITY_SUBSCRIPTION_COPY.previewLabel}</span>
        <ul>
          {pack.previewPlaybooks.map((playbook) => (
            <li key={playbook}>{playbook}</li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        aria-pressed={isSubscribed}
        className={`capability-action ${isSubscribed ? 'is-danger' : 'is-primary'}`}
        onClick={() =>
          isSubscribed ? unsubscribe(pack.domain) : subscribe(pack.domain)
        }
      >
        {isSubscribed
          ? CAPABILITY_SUBSCRIPTION_COPY.unsubscribeAction
          : CAPABILITY_SUBSCRIPTION_COPY.subscribeAction}
      </button>
    </article>
  )

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
            const isLoaded = subscribedDomains.has(domain)
            return (
              <span
                key={domain}
                className={`coverage-chip${isLoaded ? ' is-loaded' : ''}`}
              >
                {CAPABILITY_DOMAIN_LABEL[domain] ?? domain}
                {isLoaded ? <em>{CAPABILITY_SUBSCRIPTION_COPY.subscribedBadge}</em> : null}
              </span>
            )
          })}
        </div>
      </section>

      <section
        className="capability-group capability-subscription-group"
        aria-label={CAPABILITY_SUBSCRIPTION_COPY.coverageTitle}
      >
        <div className="detail-section-head">
          <p className="eyebrow">{CAPABILITY_SUBSCRIPTION_COPY.coverageEyebrow}</p>
          <h3>{CAPABILITY_SUBSCRIPTION_COPY.coverageTitle}</h3>
        </div>
        {subscribedPackages.length > 0 ? (
          <div className="capability-grid capability-package-grid">
            {subscribedPackages.map((pack) => packageCard(pack, true))}
          </div>
        ) : (
          <p className="detail-empty">{CAPABILITY_SUBSCRIPTION_COPY.emptyCoverage}</p>
        )}
      </section>

      <section
        className="capability-group capability-subscription-group"
        aria-label={CAPABILITY_SUBSCRIPTION_COPY.expandTitle}
      >
        <div className="detail-section-head">
          <p className="eyebrow">{CAPABILITY_SUBSCRIPTION_COPY.expandEyebrow}</p>
          <h3>{CAPABILITY_SUBSCRIPTION_COPY.expandTitle}</h3>
        </div>
        {availablePackages.length > 0 ? (
          <div className="capability-grid capability-package-grid">
            {availablePackages.map((pack) => packageCard(pack, false))}
          </div>
        ) : (
          <p className="detail-empty">{CAPABILITY_SUBSCRIPTION_COPY.emptyExpansion}</p>
        )}
      </section>
    </DetailShell>
  )
}

import { HERO_QUESTION } from '../../data/fixtures'

// stub —— P2 在此建 spatial orchestration flow（节点点亮 + 连线生长 + inspector）。
export function NexusScene() {
  return (
    <section className="scene scene-nexus is-active" aria-label="Nexus">
      <div className="canvas-grid" aria-hidden="true" />
      <section className="nexus-brief">
        <p className="eyebrow">Nexus orchestration</p>
        <h2>The question becomes a coordinated thread.</h2>
        <p>“{HERO_QUESTION}”</p>
        <p style={{ opacity: 0.6 }}>P2：spatial orchestration flow（PM + HR agent / 证据 / Capabilities / 输出）。</p>
      </section>
    </section>
  )
}

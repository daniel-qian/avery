import { useState } from 'react'
import { ONBOARDING, PEOPLE, PROJECTS } from '../../data/fixtures'
import { useCanvas } from '../../store/canvasStore'

// P3-03：B0 prologue = click-advance 4 步微流程（答 provenance + 首秀 Capabilities 护城河）。
// 步进是纯 UI → 全在本地 useState，零 store 改动。不 auto-play（节奏交给 rail，动效留 P5）。
// scene 卸载/重挂即重置（AmbientCanvasShell 条件渲染）→ goScene('onboarding') 天然可重入。

const FILE_KIND_LABEL: Record<string, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  csv: 'CSV',
  md: 'MD',
}

interface Stage {
  key: 'files' | 'parse' | 'capabilities' | 'ready'
  title: string
  cta: string
}

const STAGES: Stage[] = [
  { key: 'files', title: 'Reading your company files', cta: 'Continue' },
  { key: 'parse', title: 'Parsing into the company brain', cta: 'Continue' },
  { key: 'capabilities', title: 'Matching Capabilities', cta: 'Continue' },
  { key: 'ready', title: 'Company brain ready', cta: 'Enter dashboard' },
]

function StageBody({ stageKey }: { stageKey: Stage['key'] }) {
  if (stageKey === 'files') {
    return (
      <div className="onboarding-files">
        {ONBOARDING.sampleFiles.map((file) => (
          <span key={file.name} className="file-chip">
            <span className="file-kind">{FILE_KIND_LABEL[file.kind] ?? file.kind}</span>
            {file.name}
          </span>
        ))}
      </div>
    )
  }

  if (stageKey === 'parse') {
    return (
      <>
        <p className="onboarding-status">Parsing…</p>
        <div className="onboarding-parsed">
          {ONBOARDING.parsedInto.map((item) => (
            <span key={item} className="parsed-chip">
              {item}
            </span>
          ))}
        </div>
      </>
    )
  }

  if (stageKey === 'capabilities') {
    return (
      <>
        <p className="onboarding-status">Matching Capabilities…</p>
        <div className="onboarding-capabilities">
          {ONBOARDING.capabilitiesMatched.map((capability) => (
            <span key={capability} className="capability-match">
              <span className="match-badge">Auto-prioritized</span>
              {capability}
            </span>
          ))}
        </div>
      </>
    )
  }

  // ready
  return (
    <>
      <p className="onboarding-status">Jumping to the steady state…</p>
      <div className="onboarding-ready-metrics">
        <span>
          <strong>{PEOPLE.length}</strong> people
        </span>
        <span>
          <strong>{PROJECTS.length}</strong> projects
        </span>
        <span>
          <strong>{ONBOARDING.capabilitiesMatched.length}</strong> Capability sets
        </span>
      </div>
    </>
  )
}

function doneSummary(stageKey: Stage['key']): string {
  switch (stageKey) {
    case 'files':
      return `${ONBOARDING.sampleFiles.length} files read`
    case 'parse':
      return `Company brain built · ${ONBOARDING.parsedInto.length} facets`
    case 'capabilities':
      return `${ONBOARDING.capabilitiesMatched.length} Capability sets auto-loaded`
    default:
      return ''
  }
}

export function OnboardingScene() {
  const goScene = useCanvas((s) => s.goScene)
  const [step, setStep] = useState(0)

  const advance = () => {
    if (step >= STAGES.length - 1) {
      goScene('dashboard') // 第 4 步 → 进入稳态 Dashboard
      return
    }
    setStep((current) => current + 1)
  }

  return (
    <section className="scene scene-onboarding is-active" aria-label="Onboarding">
      <div className="canvas-grid" aria-hidden="true" />
      <div className="onboarding-card">
        <header className="onboarding-head">
          <p className="eyebrow">Onboarding · prologue</p>
          <h2>Building the company brain</h2>
          <p>{ONBOARDING.caption}</p>
        </header>

        <div className="onboarding-progress" aria-label={`Step ${step + 1} of ${STAGES.length}`}>
          {STAGES.map((stage, index) => (
            <span
              key={stage.key}
              className={[
                'progress-pip',
                index < step && 'is-done',
                index === step && 'is-active',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>

        <ol className="onboarding-stages">
          {STAGES.map((stage, index) => {
            const state = index < step ? 'done' : index === step ? 'active' : 'upcoming'
            return (
              <li key={stage.key} className={`onboarding-stage is-${state}`}>
                <div className="stage-marker" aria-hidden="true">
                  {state === 'done' ? '✓' : index + 1}
                </div>
                <div className="stage-content">
                  <h3>{stage.title}</h3>
                  {state === 'active' ? <StageBody stageKey={stage.key} /> : null}
                  {state === 'done' ? <p className="stage-done">{doneSummary(stage.key)}</p> : null}
                </div>
              </li>
            )
          })}
        </ol>

        <div className="onboarding-actions">
          <button type="button" className="onboarding-continue" onClick={advance}>
            {STAGES[step].cta}
          </button>
        </div>
      </div>
    </section>
  )
}

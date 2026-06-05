import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion'
import {
  CAPABILITIES,
  DASHBOARD_TAGS,
  HERO_QUESTION,
  PEOPLE,
  PROJECTS,
  SIGNALS,
  type CapabilityEntry,
  type Person,
  type Project,
} from '../../data/fixtures'
import { PERSON_POS, PROJECT_POS, type Pos } from '../../data/layout'
import { focusEntity, focusSearch, focusTags } from '../../lib/focus'
import { SvgEdgeLayer } from '../SvgEdgeLayer'
import { useCanvas, type Focus } from '../../store/canvasStore'

const NODE_GUTTER = 18

type ReferenceKind = 'person' | 'project' | 'capability' | 'file'
type ReferenceFilter = 'all' | Exclude<ReferenceKind, 'file'>

interface ComposerReference {
  id: string
  kind: ReferenceKind
  label: string
  meta: string
}

const REFERENCE_FILTERS: Array<{ id: ReferenceFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'person', label: 'People' },
  { id: 'project', label: 'Projects' },
  { id: 'capability', label: 'Capabilities' },
]

function nodeStyle(pos: Pos, widthPx: number) {
  const half = Math.ceil(widthPx / 2) + NODE_GUTTER
  return {
    left: `clamp(${half}px, ${pos.x}%, calc(100% - ${half}px))`,
    top: `clamp(112px, ${pos.y}%, calc(100% - 118px))`,
    x: '-50%',
    y: '-50%',
  }
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function statusTone(status: string) {
  if (status === 'blocked') return 'tone-danger'
  if (status === 'at-risk') return 'tone-warning'
  return ''
}

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function personHud(person: Person) {
  const loadPct = person.capacityPct ?? 100
  return {
    loadPct,
    hpPct: clampPct(100 - loadPct),
    mpPct: clampPct(person.moodPct),
  }
}

function personTone(hud: ReturnType<typeof personHud>) {
  if (hud.hpPct <= 0) return 'tone-danger'
  if (hud.hpPct <= 12) return 'tone-warning'
  return 'tone-stable'
}

function ownerName(project: Project) {
  return PEOPLE.find((p) => p.id === project.ownerId)?.name ?? 'Unassigned'
}

function personReference(person: Person): ComposerReference {
  return { id: `person-${person.id}`, kind: 'person', label: person.name, meta: person.role }
}

function projectReference(project: Project): ComposerReference {
  return {
    id: `project-${project.id}`,
    kind: 'project',
    label: project.title,
    meta: ownerName(project),
  }
}

function capabilityReference(capability: CapabilityEntry): ComposerReference {
  return {
    id: `capability-${capability.id}`,
    kind: 'capability',
    label: capability.title,
    meta: capability.domain,
  }
}

function focusReferenceOf(focus: Focus | null): ComposerReference | null {
  if (!focus?.primary) return null
  if (focus.primary.kind === 'person') {
    const person = PEOPLE.find((p) => p.id === focus.primary?.id)
    return person ? personReference(person) : null
  }

  const project = PROJECTS.find((p) => p.id === focus.primary?.id)
  return project ? projectReference(project) : null
}

function isPrimary(focus: Focus | null, kind: 'person' | 'project', id: string) {
  return focus?.primary?.kind === kind && focus.primary.id === id
}

function isRelated(focus: Focus | null, kind: 'person' | 'project', id: string) {
  if (!focus) return false
  return kind === 'person' ? focus.personIds.includes(id) : focus.projectIds.includes(id)
}

function classNames(parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// P1：Calm = low-density map. Focus = one resolved relatedness set from lib/focus.ts.
export function DashboardScene() {
  const focus = useCanvas((s) => s.focus)
  const setFocus = useCanvas((s) => s.setFocus)
  const openDetail = useCanvas((s) => s.openDetail)
  const askQuestion = useCanvas((s) => s.askQuestion)
  const briefing = useCanvas((s) => s.briefing)
  const prefersReducedMotion = useReducedMotion()
  const [searchQuery, setSearchQuery] = useState('')
  const [question, setQuestion] = useState(HERO_QUESTION)
  const [composerOpen, setComposerOpen] = useState(false)
  const [referenceMenuOpen, setReferenceMenuOpen] = useState(false)
  const [referenceFilter, setReferenceFilter] = useState<ReferenceFilter>('all')
  const [referenceQuery, setReferenceQuery] = useState('')
  const [references, setReferences] = useState<ComposerReference[]>([])

  const hasFocus = Boolean(focus)
  const selectedTagIds = focus?.source === 'tag' ? focus.selector?.tags ?? [] : []
  const transition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }

  const alertPills = useMemo(() => {
    const hotspotSignals = SIGNALS.filter((s) => s.subjectId === 'p_connector')
    return [
      {
        id: 'connector-hotspot',
        label: 'Hot spot',
        title: 'Connector signals disagree with Monday status',
        detail: `${hotspotSignals.length} live signals`,
        projectId: 'p_connector',
      },
      {
        id: 'acme-risk',
        label: 'At risk',
        title: 'Acme Pilot depends on Connector',
        detail: 'Friday ship pressure',
        projectId: 'p_acme',
      },
    ]
  }, [])

  const focusReference = useMemo(() => focusReferenceOf(focus), [focus])

  const visibleReferences = useMemo(() => {
    const refs = focusReference ? [focusReference] : []
    for (const ref of references) {
      if (!refs.some((existing) => existing.id === ref.id)) refs.push(ref)
    }
    return refs
  }, [focusReference, references])

  const referenceOptions = useMemo(() => {
    const query = referenceQuery.trim().toLowerCase()
    const allOptions = [
      ...PEOPLE.map(personReference),
      ...PROJECTS.map(projectReference),
      ...CAPABILITIES.map(capabilityReference),
    ]

    return allOptions.filter((option) => {
      if (referenceFilter !== 'all' && option.kind !== referenceFilter) return false
      if (!query) return true
      return `${option.label} ${option.meta}`.toLowerCase().includes(query)
    })
  }, [referenceFilter, referenceQuery])

  const isComposerExpanded = hasFocus || composerOpen || referenceMenuOpen || visibleReferences.length > 0

  useEffect(() => {
    if (focus?.source === 'search') {
      setSearchQuery(focus.selector?.query ?? '')
    } else {
      setSearchQuery('')
    }
  }, [focus])

  function stopPropagation(event: MouseEvent) {
    event.stopPropagation()
  }

  function clearFocus() {
    setFocus(null)
    setSearchQuery('')
    setReferenceMenuOpen(false)
  }

  function handleTagClick(tagId: string) {
    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId]
    setFocus(next.length > 0 ? focusTags(next) : null)
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setFocus(value.trim() ? focusSearch(value) : null)
  }

  function handleNodeClick(kind: 'person' | 'project', id: string) {
    if (isPrimary(focus, kind, id)) {
      openDetail(kind === 'person' ? 'employee' : 'project', id)
      return
    }
    setFocus(focusEntity(kind, id))
  }

  function handleAskQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()
    const text = question.trim() || HERO_QUESTION
    setReferenceMenuOpen(false)
    askQuestion(text)
  }

  function addReference(reference: ComposerReference) {
    setReferences((current) =>
      current.some((existing) => existing.id === reference.id) ? current : [...current, reference],
    )
    setReferenceQuery('')
    setReferenceMenuOpen(false)
    setComposerOpen(true)
  }

  function addAttachment() {
    setReferences((current) => [
      ...current,
      {
        id: `file-${current.filter((ref) => ref.kind === 'file').length + 1}`,
        kind: 'file',
        label: 'Acme_Pilot_SOW.docx',
        meta: 'Attachment',
      },
    ])
    setReferenceMenuOpen(false)
    setComposerOpen(true)
  }

  function removeReference(id: string) {
    setReferences((current) => current.filter((ref) => ref.id !== id))
  }

  return (
    <section
      className={classNames([
        'scene scene-dashboard is-active',
        hasFocus && 'has-focus',
      ])}
      aria-label="Dashboard"
      onClick={clearFocus}
    >
      <div className="canvas-grid" aria-hidden="true" />
      <SvgEdgeLayer />

      <div className="dashboard-control-layer" onClick={stopPropagation}>
        <div className="dashboard-tags" aria-label="Dashboard focus tags">
          {DASHBOARD_TAGS.map((tag) => {
            const active = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                className={classNames(['dashboard-tag', active && 'is-active'])}
                aria-pressed={active}
                onClick={() => handleTagClick(tag.id)}
              >
                {tag.label}
              </button>
            )
          })}
        </div>
        <label className="dashboard-search">
          <span>Find</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="person or project"
            onChange={(event) => handleSearchChange(event.currentTarget.value)}
          />
        </label>
      </div>

      <motion.section
        className="briefing-layer"
        aria-label="Executive briefing"
        style={{ x: '-50%', y: '-50%' }}
        animate={{ opacity: hasFocus ? 0.28 : 1, scale: hasFocus ? 0.96 : 1 }}
        transition={transition}
      >
        <p className="eyebrow">Live organization weather</p>
        <h2>{briefing.headline}</h2>
        <p>{briefing.subhead}</p>
        <div className="metric-row" aria-label="Key metrics">
          {briefing.metrics.map((m) => (
            <span key={m.label}>
              <strong>{m.value}</strong> {m.label}
            </span>
          ))}
        </div>
      </motion.section>

      <div className="alert-pill-layer" aria-label="Dashboard alerts" onClick={stopPropagation}>
        {alertPills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            className="alert-pill"
            onClick={() => setFocus(focusEntity('project', pill.projectId))}
          >
            <span className="alert-label">{pill.label}</span>
            <span>
              <strong>{pill.title}</strong>
              <small>{pill.detail}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="people-layer" aria-label="People orbit">
        {PEOPLE.map((person) => {
          const pos = PERSON_POS[person.id]
          if (!pos) return null
          const hud = personHud(person)
          const related = isRelated(focus, 'person', person.id)
          const primary = isPrimary(focus, 'person', person.id)
          const muted = hasFocus && !related
          return (
            <motion.button
              key={person.id}
              type="button"
              className={classNames([
                'person-node',
                personTone(hud),
                hud.mpPct < 40 && 'has-low-mp',
                muted && 'is-muted',
                related && 'is-related',
                primary && 'is-focused',
              ])}
              style={nodeStyle(pos, 156)}
              animate={{ opacity: muted ? 0.24 : 1, scale: primary ? 1.08 : related ? 1.02 : 1 }}
              transition={transition}
              aria-label={`${primary ? 'Open' : 'Focus'} ${person.name}. HP ${hud.hpPct}. MP ${hud.mpPct}. ${hud.loadPct}% load.`}
              aria-pressed={primary}
              onClick={(event) => {
                event.stopPropagation()
                handleNodeClick('person', person.id)
              }}
            >
              <span className="avatar" aria-hidden="true">
                {initials(person.name)}
              </span>
              <span className="person-body">
                <h3>{person.name}</h3>
                <p className="person-role">{person.role}</p>
                <span className="person-stats person-hud" aria-hidden="true">
                  <span className="hud-meter hud-hp">
                    <span className="hud-label">
                      <strong>HP</strong>
                      <em>{hud.hpPct}</em>
                    </span>
                    <span className="hud-track">
                      <span className="hud-fill" style={{ width: `${hud.hpPct}%` }} />
                    </span>
                  </span>
                  <span className="hud-meter hud-mp">
                    <span className="hud-label">
                      <strong>MP</strong>
                      <em>{hud.mpPct}</em>
                    </span>
                    <span className="hud-track">
                      <span className="hud-fill" style={{ width: `${hud.mpPct}%` }} />
                    </span>
                  </span>
                  <span className="hud-load">{hud.loadPct}% load</span>
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="project-layer" aria-label="Project layer">
        {PROJECTS.map((project) => {
          const pos = PROJECT_POS[project.id]
          if (!pos) return null
          const related = isRelated(focus, 'project', project.id)
          const primary = isPrimary(focus, 'project', project.id)
          const muted = hasFocus && !related
          return (
            <motion.button
              key={project.id}
              type="button"
              className={classNames([
                'project-card',
                muted && 'is-muted',
                related && 'is-related',
                primary && 'is-focused',
              ])}
              style={nodeStyle(pos, 244)}
              animate={{ opacity: muted ? 0.24 : 1, scale: primary ? 1.08 : related ? 1.02 : 1 }}
              transition={transition}
              aria-label={primary ? `Open ${project.title}` : `Focus ${project.title}`}
              aria-pressed={primary}
              onClick={(event) => {
                event.stopPropagation()
                handleNodeClick('project', project.id)
              }}
            >
              <span className="project-status">
                <span className={`status-dot ${statusTone(project.status)}`} />
                <span>{project.status.replace('-', ' ')}</span>
              </span>
              <h3>{project.title}</h3>
              <div className="project-detail">
                {project.summary && <p>{project.summary}</p>}
                <div className="progress-track" aria-label={`${project.progress}% complete`}>
                  <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="project-meta">
                  <span>{project.progress}% complete</span>
                  <span>{ownerName(project)}</span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.div
        className={classNames(['composer-layer', isComposerExpanded && 'is-expanded'])}
        style={{ x: '-50%' }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        onClick={stopPropagation}
      >
        <form className="composer-card" onSubmit={handleAskQuestion}>
          <div className="composer-main-row">
            <input
              value={question}
              onClick={() => setComposerOpen(true)}
              onFocus={() => window.setTimeout(() => setComposerOpen(true), 180)}
              onChange={(event) => setQuestion(event.currentTarget.value)}
              aria-label="Ask Nexus"
            />
            <button type="submit" className="icon-button">
              Ask
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isComposerExpanded && (
              <motion.div
                className="composer-reference-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={transition}
              >
                <button
                  type="button"
                  className="composer-add-button"
                  aria-label="Add reference or attachment"
                  aria-expanded={referenceMenuOpen}
                  onClick={() => {
                    setComposerOpen(true)
                    setReferenceMenuOpen((open) => !open)
                  }}
                >
                  +
                </button>
                <div className="composer-reference-chips" aria-label="Composer references">
                  {visibleReferences.map((reference) => (
                    <span key={reference.id} className={`composer-reference-chip is-${reference.kind}`}>
                      <span>{reference.label}</span>
                      {reference.kind !== 'project' && <small>{reference.meta}</small>}
                      {reference.id !== focusReference?.id && (
                        <button
                          type="button"
                          aria-label={`Remove ${reference.label}`}
                          onClick={() => removeReference(reference.id)}
                        >
                          x
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {referenceMenuOpen && (
              <motion.div
                className="composer-reference-picker"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={transition}
              >
                <div className="reference-picker-actions">
                  <button type="button" onClick={addAttachment}>
                    Attach file
                  </button>
                  {REFERENCE_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={filter.id === referenceFilter ? 'is-active' : ''}
                      aria-pressed={filter.id === referenceFilter}
                      onClick={() => setReferenceFilter(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <input
                  type="search"
                  value={referenceQuery}
                  placeholder="Reference person, project, or capability"
                  aria-label="Filter references"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.preventDefault()
                  }}
                  onChange={(event) => setReferenceQuery(event.currentTarget.value)}
                />
                <div className="reference-picker-list">
                  {referenceOptions.map((option) => (
                    <button key={option.id} type="button" onClick={() => addReference(option)}>
                      <span>{option.label}</span>
                      <small>{option.meta}</small>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </section>
  )
}

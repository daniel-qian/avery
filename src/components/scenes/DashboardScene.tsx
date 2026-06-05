import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import { motion, useReducedMotion, type Transition } from 'framer-motion'
import {
  DASHBOARD_TAGS,
  HERO_QUESTION,
  PEOPLE,
  PROJECTS,
  SIGNALS,
  type Person,
  type Project,
} from '../../data/fixtures'
import { PERSON_POS, PROJECT_POS, type Pos } from '../../data/layout'
import { focusEntity, focusSearch, focusTags } from '../../lib/focus'
import { SvgEdgeLayer } from '../SvgEdgeLayer'
import { useCanvas, type Focus } from '../../store/canvasStore'

const NODE_GUTTER = 18

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

  const hasFocus = Boolean(focus)
  const selectedTagIds = focus?.source === 'tag' ? focus.selector?.tags ?? [] : []
  const hasProjectPrimary = focus?.primary?.kind === 'project'
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
    askQuestion(text)
  }

  return (
    <section
      className={classNames([
        'scene scene-dashboard is-active',
        hasFocus && 'has-focus',
        hasProjectPrimary && 'has-project-focus',
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
        className="composer-layer"
        style={{ x: '-50%' }}
        animate={{ opacity: hasProjectPrimary ? 0.22 : 1, y: hasProjectPrimary ? 14 : 0 }}
        transition={transition}
        onClick={stopPropagation}
      >
        <form className="composer-card" onSubmit={handleAskQuestion}>
          <input
            value={question}
            onChange={(event) => setQuestion(event.currentTarget.value)}
            aria-label="Ask Nexus"
          />
          <button type="submit" className="icon-button">
            Ask
          </button>
        </form>
      </motion.div>
    </section>
  )
}

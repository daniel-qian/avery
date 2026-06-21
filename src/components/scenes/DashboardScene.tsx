import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion'
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
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
  type ProjectRisk,
} from '../../data/fixtures'
import { PERSON_POS, PROJECT_POS, TEAM_ZONES, type Pos } from '../../data/layout'
import { bboxOf } from '../../data/board'
import {
  dashboardPersonCopy,
  dashboardProjectCopy,
  type DetailPhase,
} from '../../data/fixtures.p3'
import { focusEntity, focusSearch, focusTags } from '../../lib/focus'
import { SvgEdgeLayer } from '../SvgEdgeLayer'
import { PanZoomCanvas } from '../PanZoomCanvas'
import { useRailCamera, type CameraTarget, type SafeInsets } from '../../lib/useRailCamera'
import { PixelAvatar } from '../PixelAvatar'
import { useCanvas, type Focus } from '../../store/canvasStore'

// world 对象的估算半宽/半高（board px），仅供镜头算包围盒。
// 修订 5：person = 名册圆点（avatar 圆 + 名牌），project = 横条（calm 即全卡后更高）。
const PERSON_HALF = { w: 80, h: 78 }
const PROJECT_HALF = { w: 360, h: 78 }

// 项目 focus 态的风险分布图（world 对象）：贴在被 focus 项目条右侧，回 calm 即消失。
const RISK_CHART_LEFT = 1958 // 图左缘 x（条右缘 1920 + 38 间隙）
const RISK_CHART_CENTER_X = 2128
const RISK_CHART_HALF = { w: 180, h: 145 }

const RISK_DIMS: Array<{ key: keyof ProjectRisk; label: string; color: string }> = [
  { key: 'progress', label: 'Progress', color: 'rgba(105, 128, 109, 0.85)' }, // sage
  { key: 'blockers', label: 'Blockers', color: 'rgba(188, 92, 73, 0.85)' }, // terracotta
  { key: 'staffing', label: 'Staffing', color: 'rgba(178, 123, 43, 0.85)' }, // honey
  { key: 'quality', label: 'Quality', color: 'rgba(82, 123, 145, 0.85)' }, // sky
]

// Dashboard inset（修订 3）：full-bleed——近零 inset 让 glance map 填满整屏；HUD（briefing/alerts/
// composer）作为可叠放角落 chrome 浮在地图边角之上。只留够清 Topbar/tag 条与 composer 的薄边。
const DASHBOARD_INSETS: SafeInsets = { top: 76, right: 28, bottom: 112, left: 28 }

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
  { id: 'capability', label: 'Playbooks' },
]

// board 绝对坐标（修订 2：world 对象 board px only，禁 clamp/vw）。
function nodeStyle(pos: Pos) {
  return { left: `${pos.x}px`, top: `${pos.y}px`, x: '-50%', y: '-50%' }
}

function statusTone(status: string) {
  if (status === 'blocked') return 'tone-danger'
  if (status === 'at-risk') return 'tone-warning'
  return ''
}

// 卡根节点专用 tone 类。不能复用 tone-warning/tone-danger——那是给 status-dot 等
// 小元素的通用类，自带 background: var(--honey/terracotta)，挂到卡根会整卡涂色。
function riskToneClass(status: string) {
  if (status === 'blocked') return 'risk-danger'
  if (status === 'at-risk') return 'risk-warning'
  return ''
}

// 进度条按百分比分档着色（与 status 解耦）：<40 低档红、40–69 中档琥珀、≥70 高档绿。
function progressBand(progress: number) {
  if (progress < 40) return 'strip-low'
  if (progress < 70) return 'strip-mid'
  return 'strip-high'
}

// 个人节点 tone（修订：不再给单人贴血条/数值）。只保留一个安静的定性强调——
// 谁这周值得搭把手——绝不显示 HP/MP/load 数字。capacityPct 仍是内部判据，但不外显。
function personTone(person: Person) {
  const load = person.capacityPct ?? 100
  if (load >= 120) return 'tone-warning'
  return 'tone-stable'
}

// ── 团队级柔性信号（创始人拍板：不量化个人，改集体、人味的读数）──────────────
// 一个团队整体这周的节奏，由该组所有人的负载/心气聚合而来。措辞像前辈在描述
// 一个组的处境，而不是给谁打分；不并列任何单人数值。
function teamPace(team: string): { read: string; tone: string } | null {
  const members = PEOPLE.filter((p) => p.team === team)
  if (members.length === 0) return null
  const avgLoad =
    members.reduce((sum, p) => sum + (p.capacityPct ?? 100), 0) / members.length
  const avgMood = members.reduce((sum, p) => sum + p.moodPct, 0) / members.length
  const stretched = members.filter((p) => (p.capacityPct ?? 100) >= 120).length

  if (avgLoad >= 110 || stretched >= 2) {
    return { read: 'Stretched thin this week', tone: 'tone-warning' }
  }
  if (avgLoad >= 95 || avgMood < 60) {
    return { read: 'Carrying a full load', tone: 'tone-stable' }
  }
  if (avgLoad < 78) {
    return { read: 'Room to take more on', tone: 'tone-stable' }
  }
  return { read: 'Finding a steady rhythm', tone: 'tone-stable' }
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
  // 决定 2（Danny）：天气摘要行常驻可见，详情卡只靠「点击」展开/收起——去掉 hover 触发
  //（Dana 是只扫一眼型用户，hover 弹卡会被忽略且鼠标划过误弹）。
  const [briefingOpen, setBriefingOpen] = useState(false)

  // 大横幅压成一行摘要：headline 首句（到第一个 em-dash / 句号）+ 关键读数并排。
  // 单复数修正：value 恰为 "1" 时把复数 label 去掉结尾 's"（"1 hot spots" → "1 hot spot"）。
  const briefingSummary = useMemo(() => {
    const lead = briefing.headline.split(/\s*[—.]\s*/)[0].trim()
    const reads = briefing.metrics.map((m) => {
      const label = m.value.trim() === '1' && m.label.endsWith('s') ? m.label.slice(0, -1) : m.label
      return `${m.value} ${label}`
    })
    return [lead, ...reads].join(' · ')
  }, [briefing])

  const dashboardPhase: DetailPhase = briefing.version === 2 ? 'grown' : 'believed'
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
        label: 'Worth a look',
        title: 'The core guide flow has more churn than the status let on', // ⚠ 待 Danny 审字
        detail: `${hotspotSignals.length} things worth checking`,
        projectId: 'p_connector',
      },
      {
        id: 'acme-risk',
        label: 'Keep an eye on',
        title: 'The demo is leaning on the core guide flow to make Friday', // ⚠ 待 Danny 审字
        detail: 'Friday is getting tight',
        projectId: 'p_acme',
      },
    ]
  }, [])

  const focusReference = useMemo(() => focusReferenceOf(focus), [focus])

  // focus 项目 → 风险分布图（world 对象，贴条右侧；回 calm 消失）。
  const riskProject = useMemo(() => {
    if (focus?.primary?.kind !== 'project') return null
    return PROJECTS.find((p) => p.id === focus.primary?.id) ?? null
  }, [focus])

  // ── rail 派生镜头（ADR-0012 决策 4）：calm = 全图 fit；focus = 飞向关联簇局部 bbox。──
  const camRef = useRef<ReactZoomPanPinchRef | null>(null)

  const cameraTarget = useMemo<CameraTarget | null>(() => {
    const items: Array<{ pos: Pos; halfW: number; halfH: number }> = []
    if (!focus) {
      PEOPLE.forEach((p) => {
        const pos = PERSON_POS[p.id]
        if (pos) items.push({ pos, halfW: PERSON_HALF.w, halfH: PERSON_HALF.h })
      })
      PROJECTS.forEach((p) => {
        const pos = PROJECT_POS[p.id]
        if (pos) items.push({ pos, halfW: PROJECT_HALF.w, halfH: PROJECT_HALF.h })
      })
      // 修订 6：calm = fit-width 顶锚可读帧（宽度装满，下方组允许出帧、靠 pan 到达）。
      const bbox = bboxOf(items)
      return bbox ? { bbox, mode: 'width-top' } : null
    }
    const personIds = new Set(focus.personIds)
    if (focus.primary?.kind === 'person') personIds.add(focus.primary.id)
    const projectIds = new Set(focus.projectIds)
    if (focus.primary?.kind === 'project') projectIds.add(focus.primary.id)
    personIds.forEach((id) => {
      const pos = PERSON_POS[id]
      if (pos) items.push({ pos, halfW: PERSON_HALF.w, halfH: PERSON_HALF.h })
    })
    projectIds.forEach((id) => {
      const pos = PROJECT_POS[id]
      if (pos) items.push({ pos, halfW: PROJECT_HALF.w, halfH: PROJECT_HALF.h })
    })
    // 项目为 primary 时，风险分布图也算进取景 bbox。
    if (focus.primary?.kind === 'project') {
      const pos = PROJECT_POS[focus.primary.id]
      if (pos) {
        items.push({
          pos: { x: RISK_CHART_CENTER_X, y: pos.y },
          halfW: RISK_CHART_HALF.w,
          halfH: RISK_CHART_HALF.h,
        })
      }
    }
    const bbox = bboxOf(items)
    return bbox ? { bbox } : null
  }, [focus])

  const cameraKey = useMemo(() => {
    if (!focus) return 'calm'
    return `${focus.source}|${[...focus.personIds].sort().join(',')}|${[...focus.projectIds]
      .sort()
      .join(',')}|${focus.primary?.id ?? ''}`
  }, [focus])

  useRailCamera(camRef, cameraTarget, DASHBOARD_INSETS, cameraKey, { maxFitScale: 1.05 })

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
        label: 'Smart_Shopping_Guide_Brief.docx', // ⚠ 待 Danny 审字
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
      aria-label="Your team"
      onClick={clearFocus}
    >
      <PanZoomCanvas ref={camRef}>
        <div className="canvas-grid board-surface" aria-hidden="true" />
        <SvgEdgeLayer />

        <div className="zone-label-layer">
          {TEAM_ZONES.map((zone) => {
            const pace = teamPace(zone.team)
            return (
              <span
                key={zone.team}
                className="team-zone-label"
                style={{ left: `${zone.labelPos.x}px`, top: `${zone.labelPos.y}px` }}
              >
                <span className="team-zone-name" aria-hidden="true">
                  {zone.label}
                </span>
                {pace ? (
                  <span
                    className={classNames(['team-zone-pace', pace.tone])}
                    aria-label={`${zone.label} — ${pace.read}`}
                  >
                    {pace.read}
                  </span>
                ) : null}
              </span>
            )
          })}
        </div>

      <div className="people-layer" aria-label="People orbit">
        {PEOPLE.map((person) => {
          const pos = PERSON_POS[person.id]
          if (!pos) return null
          const cardCopy = dashboardPersonCopy(person, dashboardPhase)
          const related = isRelated(focus, 'person', person.id)
          const primary = isPrimary(focus, 'person', person.id)
          const muted = hasFocus && !related
          return (
            <motion.button
              key={person.id}
              type="button"
              className={classNames([
                'person-node',
                personTone(person),
                muted && 'is-muted',
                related && 'is-related',
                primary && 'is-focused',
              ])}
              style={nodeStyle(pos)}
              animate={{ opacity: muted ? 0.24 : 1, scale: primary ? 1.08 : related ? 1.02 : 1 }}
              transition={transition}
              aria-label={`${primary ? 'Open' : 'Focus'} ${person.name} — ${cardCopy.roleLine}`}
              aria-pressed={primary}
              onClick={(event) => {
                event.stopPropagation()
                handleNodeClick('person', person.id)
              }}
            >
              <PixelAvatar person={person} size={56} className="person-avatar" />
              <span className="person-body">
                <h3>{person.lastInitial ? `${person.name} ${person.lastInitial}.` : person.name}</h3>
                <p className="person-role">{cardCopy.roleLine}</p>
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="project-layer" aria-label="Project layer">
        {PROJECTS.map((project) => {
          const pos = PROJECT_POS[project.id]
          if (!pos) return null
          const cardCopy = dashboardProjectCopy(project, dashboardPhase)
          const related = isRelated(focus, 'project', project.id)
          const primary = isPrimary(focus, 'project', project.id)
          const muted = hasFocus && !related
          return (
            <motion.button
              key={project.id}
              type="button"
              className={classNames([
                'project-card',
                riskToneClass(project.status),
                muted && 'is-muted',
                related && 'is-related',
                primary && 'is-focused',
              ])}
              style={nodeStyle(pos)}
              animate={{ opacity: muted ? 0.24 : 1, scale: primary ? 1.08 : related ? 1.02 : 1 }}
              transition={transition}
              aria-label={primary ? `Open ${project.title}` : `Focus ${project.title}`}
              aria-pressed={primary}
              onClick={(event) => {
                event.stopPropagation()
                handleNodeClick('project', project.id)
              }}
            >
              <span className="project-bar-row">
                <h3>{project.title}</h3>
                <span className="project-status">
                  <span className={`status-dot ${statusTone(project.status)}`} />
                  <span>{cardCopy.statusLabel}</span>
                </span>
              </span>
              <p className="project-summary">{cardCopy.summary}</p>
              <span className="project-progress" aria-label={`${project.progress}% complete`}>
                <span className="project-progress-label">Progress</span>
                <span className={`project-strip ${progressBand(project.progress)}`}>
                  <span
                    className="project-strip-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </span>
                <span className="project-progress-pct">{project.progress}%</span>
              </span>
              <div className="project-meta">
                <span>{ownerName(project)}</span>
                {project.dueDate ? <span>{project.dueDate}</span> : null}
              </div>
            </motion.button>
          )
        })}
      </div>

        <AnimatePresence>
          {riskProject?.risk ? (
            <motion.aside
              key={riskProject.id}
              className="risk-chart"
              style={{
                left: `${RISK_CHART_LEFT}px`,
                top: `${PROJECT_POS[riskProject.id]?.y ?? 0}px`,
              }}
              initial={{ opacity: 0, x: -16, y: '-50%' }}
              animate={{ opacity: 1, x: 0, y: '-50%' }}
              exit={{ opacity: 0, x: -16, y: '-50%' }}
              transition={transition}
              aria-label={`${riskProject.title} risk distribution`}
              onClick={stopPropagation}
            >
              <p className="eyebrow">Risk distribution</p>
              <div className="risk-bars">
                {RISK_DIMS.map((dim) => {
                  const value = riskProject.risk?.[dim.key] ?? 0
                  return (
                    <div key={dim.key} className="risk-bar">
                      <span className="risk-bar-value">{value}</span>
                      <span className="risk-bar-col">
                        <motion.span
                          className="risk-bar-fill"
                          style={{ background: dim.color }}
                          initial={{ height: 0 }}
                          animate={{ height: `${value}%` }}
                          transition={transition}
                        />
                      </span>
                      <span className="risk-bar-label">{dim.label}</span>
                    </div>
                  )
                })}
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </PanZoomCanvas>

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

      <motion.div
        className={classNames(['briefing-hud', briefingOpen && 'is-open'])}
        aria-label="How the team's doing"
        onClick={stopPropagation}
        animate={{ opacity: hasFocus ? 0.6 : 1 }}
        transition={transition}
      >
        <button
          type="button"
          className="briefing-pill"
          aria-expanded={briefingOpen}
          onClick={() => setBriefingOpen((open) => !open)}
        >
          <span className="briefing-pill-dot" aria-hidden="true" />
          <span className="briefing-pill-text">{briefingSummary}</span>
          <span className="briefing-pill-caret" aria-hidden="true">
            {briefingOpen ? '▴' : '▾'}
          </span>
        </button>

        {/* 决定 2：仅点击展开/收起。用条件渲染 + CSS 入场动画（p6-popover-in，与 Nexus
            brief 卡同口径）——收起即刻 unmount，不留 framer 退场残影。 */}
        {briefingOpen ? (
          <section className="briefing-card" aria-label="The longer read">
            <p className="eyebrow">How the team's doing right now</p>
            <h2>{briefing.headline}</h2>
            <p>{briefing.subhead}</p>
            <div className="metric-row" aria-label="Key metrics">
              {briefing.metrics.map((m) => (
                <span key={m.label}>
                  <strong>{m.value}</strong> {m.label}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </motion.div>

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

      <motion.div
        className={classNames(['composer-layer', isComposerExpanded && 'is-expanded'])}
        style={{ x: '-50%' }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        onClick={stopPropagation}
      >
        <motion.form
          className="composer-card"
          onSubmit={handleAskQuestion}
          animate={{ borderRadius: isComposerExpanded ? 8 : 999 }}
          transition={transition}
        >
          <div className="composer-main-row">
            <input
              value={question}
              onClick={() => setComposerOpen(true)}
              onFocus={() => setComposerOpen(true)}
              onChange={(event) => setQuestion(event.currentTarget.value)}
              aria-label="Ask about your team"
            />
            <button type="submit" className="icon-button">
              Ask
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isComposerExpanded && (
              <motion.div
                className="composer-reference-row"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={transition}
                style={{ overflow: 'hidden' }}
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
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 9 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={transition}
                style={{ overflow: 'hidden' }}
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
        </motion.form>
      </motion.div>
    </section>
  )
}

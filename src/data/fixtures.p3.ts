/**
 * TeamMaster 2.0 — P3 详情页内容 fixtures（draft v1, 2026-06-04）
 *
 * P3 详情页（员工 / 项目）独有内容 + 派生 helper 的真相源。
 * - additive：只 import 共享 fixtures.ts，绝不修改它（P1/P2 也读共享 fixtures）。
 * - 所有 user-facing 字符串英文（Venus = 美国听众）；注释中文给 Danny。
 * - 派生 helper 是纯函数吃 fixtures，零新 store state（P5-03：详情页 state-aware）。
 *
 * ⚠ 待 Danny 审字：下方所有英文 copy 是 Danny 初稿，P3-05 收口逐字审。
 * ⚠ 守则：HR analysis / weekly sentiment 口径守 *no personnel judgment*
 *         （见 fixtures.ts 的 cap_hr_interrupt / MISMATCH.safeFraming）。
 */

import {
  CAPABILITIES,
  MISMATCH,
  PEOPLE,
  PROJECTS,
  SIGNALS,
  TASKS,
  TIMELINE,
  type CapabilityEntry,
  type Person,
  type Project,
  type Signal,
  type Task,
} from './fixtures'

// ───────────────────────── 派生 helper（纯函数 · 零新 store state）─────────────

export type WorkloadStatus = 'Overloaded' | 'Steady' | 'Has capacity'
export type DetailPhase = 'believed' | 'grown'

const isBelieved = (phase: DetailPhase = 'grown') => phase === 'believed'

export interface DashboardPersonCopy {
  roleLine: string
  loadLine: string
}

export interface DashboardProjectCopy {
  statusLabel: string
  summary: string
  progressLabel: string
}

const DASHBOARD_PERSON_COPY: Record<DetailPhase, Record<string, DashboardPersonCopy>> = {
  believed: {
    u_bill: {
      roleLine: 'Overloaded by Acme interrupts',
      loadLine: '134% load · 9 pulls',
    },
    u_jason: {
      roleLine: 'Capacity visible',
      loadLine: '70% load · available',
    },
    u_vanessa: {
      roleLine: 'Friday dependency exposed',
      loadLine: '88% load · carrying Acme',
    },
  },
  grown: {
    u_bill: {
      roleLine: 'Protected focus route',
      loadLine: 'Focus protected · interrupts rerouted',
    },
    u_jason: {
      roleLine: 'Short-term overflow route',
      loadLine: 'Taking Acme-support overflow',
    },
    u_vanessa: {
      roleLine: 'Friday scope protected',
      loadLine: 'Re-baseline in motion',
    },
  },
}

const DASHBOARD_PROJECT_COPY: Record<DetailPhase, Record<string, DashboardProjectCopy>> = {
  believed: {
    p_acme: {
      statusLabel: 'at risk · dependency exposed',
      summary: 'Friday pilot still depends on a stalled Connector hookup.',
      progressLabel: '72% complete · no replan yet',
    },
    p_connector: {
      statusLabel: 'reported on track · signals at risk',
      summary: 'Slack rate limits and no-update signals conflict with Monday status.',
      progressLabel: '48% complete · stalled surface',
    },
  },
  grown: {
    p_acme: {
      statusLabel: 'at risk · diagnosed · Friday held',
      summary: 'Connector core is re-baselined; Friday ship is protected with Tuesday held as contingency.',
      progressLabel: '72% complete · actions in flight',
    },
    p_connector: {
      statusLabel: 'at risk · re-baselined',
      summary: 'Core Slack + GitHub ship is protected; non-core dedupe moves to next week.',
      progressLabel: '48% complete · focus route active',
    },
  },
}

export function dashboardPersonCopy(person: Person, phase: DetailPhase): DashboardPersonCopy {
  return (
    DASHBOARD_PERSON_COPY[phase][person.id] ?? {
      roleLine: person.role,
      loadLine: `${person.capacityPct ?? 100}% load`,
    }
  )
}

export function dashboardProjectCopy(project: Project, phase: DetailPhase): DashboardProjectCopy {
  return (
    DASHBOARD_PROJECT_COPY[phase][project.id] ?? {
      statusLabel: project.status.replace('-', ' '),
      summary: project.summary ?? 'No project summary yet.',
      progressLabel: `${project.progress}% complete`,
    }
  )
}

// Status 三档（issue / ADR-0005 口径）：>110 Overloaded · 85–110 Steady · <75 Has capacity。
// 75–85 灰区归 Steady（"Has capacity" 只留给确有余量的 <75）。无 capacityPct → null。
export function deriveStatus(
  capacityPct?: number,
): { label: WorkloadStatus; tone: string } | null {
  if (capacityPct == null) return null
  if (capacityPct > 110) return { label: 'Overloaded', tone: 'tone-warning' }
  if (capacityPct < 75) return { label: 'Has capacity', tone: 'tone-stable' }
  return { label: 'Steady', tone: 'tone-stable' }
}

// 此人「所拥有项目」的 progress（Bill→Connector 48 / Vanessa→Acme 72 / Jason→Billing 30）。
// 不拥有项目（多数 texture 人）→ null → 概览卡 Progress 槽走空态、不渲染占位灰条。
export function ownedProjectProgress(
  personId: string,
): { project: Project; progress: number } | null {
  const project = PROJECTS.find((p) => p.ownerId === personId)
  if (!project) return null
  return { project, progress: project.progress }
}

export function employeeOverviewFor(person: Person, phase: DetailPhase): EmployeeOverviewCopy {
  const owned = ownedProjectProgress(person.id)
  const status = deriveStatus(person.capacityPct)
  return (
    EMPLOYEE_OVERVIEW_COPY[phase][person.id] ?? {
      workloadLabel: 'Workload',
      workloadValue: `${person.capacityPct ?? 100}%`,
      statusLabel: status?.label ?? 'Steady',
      progressLabel: owned ? `Progress · ${owned.project.title}` : 'Progress',
      progressValue: owned ? `${owned.progress}%` : 'No owned project',
      hrSignal: hrSignalFor(person.id, phase),
    }
  )
}

// 挂在某人身上的工作信号（subjectType === 'person'）。Bill = 两条 interrupt 证据；
// texture 人 = []（HR analysis 模块据此判断是否渲染 evidence 子段）。
export function signalsFor(personId: string, _phase: DetailPhase = 'grown'): Signal[] {
  return SIGNALS.filter(
    (signal) => signal.subjectType === 'person' && signal.subjectId === personId,
  )
}

// ───────────────────────── 概览卡 · HR signal 文本（按 id 索引）─────────────────
// ⚠ 待 Danny 审字。story 人有文本；texture 人缺 → 概览走空态 "No HR signal — looks steady"。
// 口径：工作负载 / 路由信号，不是人格评价。

export const HR_SIGNAL: Record<string, string> = {
  u_bill: 'Needs manager check-in',
  u_jason: 'Has bandwidth to absorb',
  u_vanessa: 'Carrying the Acme deadline',
}

// ───────────────────────── Weekly summary + sentiment（按 id 索引）──────────────
// ⚠ 待 Danny 审字。本周工作的中性复述 + 情绪读数（描述工作处境，非对人评价）。

export type Sentiment = 'positive' | 'steady' | 'strained'

export interface WeeklySummary {
  text: string
  sentiment: Sentiment
  sentimentNote: string
}

export interface EmployeeOverviewCopy {
  workloadLabel: string
  workloadValue: string
  statusLabel: string
  progressLabel: string
  progressValue: string
  hrSignal: string | null
}

const EMPLOYEE_OVERVIEW_COPY: Record<DetailPhase, Record<string, EmployeeOverviewCopy>> = {
  believed: {
    u_bill: {
      workloadLabel: 'Observed load',
      workloadValue: '134% raw load',
      statusLabel: 'Overload symptoms',
      progressLabel: 'Connector progress',
      progressValue: '48% stalled',
      hrSignal: 'Raw interrupt load: 9 pulls',
    },
    u_jason: {
      workloadLabel: 'Observed load',
      workloadValue: '70% raw load',
      statusLabel: 'Capacity visible',
      progressLabel: 'Billing progress',
      progressValue: '30% steady',
      hrSignal: 'Raw capacity: 70%',
    },
    u_vanessa: {
      workloadLabel: 'Observed load',
      workloadValue: '88% raw load',
      statusLabel: 'Deadline carrier',
      progressLabel: 'Acme progress',
      progressValue: '72% dependency exposed',
      hrSignal: 'Friday owner: dependency exposed',
    },
  },
  grown: {
    u_bill: {
      workloadLabel: 'Protected route',
      workloadValue: 'Focus blocks reserved',
      statusLabel: 'Protected focus',
      progressLabel: 'Connector progress',
      progressValue: '48% re-baselining',
      hrSignal: 'Manager check-in + reroute',
    },
    u_jason: {
      workloadLabel: 'Overflow route',
      workloadValue: 'Taking support pulls',
      statusLabel: 'Absorbing overflow',
      progressLabel: 'Billing progress',
      progressValue: '30% protected',
      hrSignal: 'Has bandwidth to absorb',
    },
    u_vanessa: {
      workloadLabel: 'Delivery route',
      workloadValue: 'Friday scope protected',
      statusLabel: 'Re-baseline owner',
      progressLabel: 'Acme progress',
      progressValue: '72% actions in flight',
      hrSignal: 'Friday scope protected',
    },
  },
}

// ⚠ 待 Danny 审字。believed 态只放可观察症状，不放 agent 诊断 / 建议。
export const BELIEVED_WEEKLY_SUMMARY: Record<string, WeeklySummary> = {
  u_bill: {
    text: 'Bill is carrying 134% workload. The visible signals are 9 Acme-support pulls in 3 days, mostly Acme hotfix commits, and stalled Connector work.',
    sentiment: 'strained',
    sentimentNote: 'High interrupt load',
  },
  u_jason: {
    text: 'Jason is at 70% workload with no risk signals attached in the current company picture.',
    sentiment: 'positive',
    sentimentNote: 'Capacity visible',
  },
  u_vanessa: {
    text: 'Vanessa owns the Friday Acme pilot while its Connector dependency is still showing stalled work signals.',
    sentiment: 'steady',
    sentimentNote: 'Friday dependency exposed',
  },
}

export const WEEKLY_SUMMARY: Record<string, WeeklySummary> = {
  u_bill: {
    text: "Most of Bill's week went to Acme-support firefighting — 9 urgent pulls in 3 days. Connector work stalled as a result, not from lack of effort.",
    sentiment: 'strained',
    sentimentNote: 'Under interrupt pressure',
  },
  u_jason: {
    text: 'Steady week on Billing v1 with room to spare. Well placed to pick up short-term overflow from the Connector push.',
    sentiment: 'positive',
    sentimentNote: 'Room to take on more',
  },
  u_vanessa: {
    text: 'Focused on holding the Acme pilot for Friday — coordinating scope and the Connector dependency end to end.',
    sentiment: 'steady',
    sentimentNote: 'Locked on the Friday ship',
  },
}

// ───────────────────────── HR knowledge analysis（按 id 索引）──────────────────
// ⚠ 待 Danny 审字。⚠⚠ 守则：no personnel judgment。
// agent 据 HR / Project-Ops capability 生成的建议；口径是「工作负载路由」而非「人事评价」。
// capabilityId 指回 fixtures.ts 的 CAPABILITIES（护城河被 agent 自动优先引用）。

export interface HrAnalysis {
  mode: 'symptom' | 'diagnosis'
  capabilityId?: string // 引用的 capability（auto-prioritized 护城河）
  reading: string // agent 对处境的中性解读
  recommendations?: string[] // 低风险下一步
  framing?: string // 显式的 no-personnel-judgment 护栏
}

// ⚠ 待 Danny 审字。Act1 症状 payload：只并列 raw facts，不解释根因。
export const BELIEVED_HR_ANALYSIS: Record<string, HrAnalysis> = {
  u_bill: {
    mode: 'symptom',
    reading:
      'Raw workload symptoms: 134% load, 9 Acme-support mentions in 3 days, Acme hotfix commits, and Connector work still stalled.',
  },
  u_jason: {
    mode: 'symptom',
    reading:
      'Raw capacity symptom: 70% workload and no attached risk signals in the current company picture.',
  },
  u_vanessa: {
    mode: 'symptom',
    reading:
      'Raw project symptom: Vanessa owns a Friday Acme ship while the Connector dependency is still showing stalled signals.',
  },
}

export const HR_ANALYSIS: Record<string, HrAnalysis> = {
  u_bill: {
    mode: 'diagnosis',
    capabilityId: 'cap_hr_interrupt',
    reading:
      'Reduced Connector output lines up with interrupt load, not performance. Bill absorbed 9 Acme-support pulls in 3 days; the stall is a routing problem, not a capability one.',
    recommendations: [
      'Route incoming Acme-support interrupts to someone with capacity for 2 days so Bill can focus the Connector.',
      'Protect 2 uninterrupted focus blocks this week and confirm the trimmed Connector scope with him.',
      'Hold a low-key manager check-in to confirm load — frame it as rebalancing, not review.',
    ],
    framing: 'Evidence-based workload routing. No personnel judgment is implied.',
  },
  u_jason: {
    mode: 'diagnosis',
    capabilityId: 'cap_hr_interrupt',
    reading:
      'Jason is running below full load with a clean signal picture — a natural candidate to absorb short-term overflow without risking burnout.',
    recommendations: [
      'Offer Jason the Acme-support interrupts for 2 days to unblock the Connector.',
      'Keep the handoff time-boxed so Billing v1 stays on track.',
    ],
    framing: 'Capacity-based routing suggestion. No personnel judgment is implied.',
  },
  u_vanessa: {
    mode: 'diagnosis',
    capabilityId: 'cap_po_dep',
    reading:
      'Vanessa is carrying a cross-team dependency close to a ship date. The exposure is coordination load, not delivery quality.',
    recommendations: [
      'Confirm the trimmed Connector scope with Bill today to protect the Friday core ship.',
      'Keep the Tuesday slip ready as a stated contingency rather than a silent fallback.',
    ],
    framing: 'Dependency-routing guidance. No personnel judgment is implied.',
  },
}

// ───────────────────────── 故事人集合 + 空态判定 ──────────────────────────────
// 故事人 = 有完整 HR analysis 草拟内容的人（Bill / Jason / Vanessa）。
// 用 HR_ANALYSIS 的 key 派生 → 单一真相源：加一个故事人只改上面的内容块。
export const STORY_PEOPLE = new Set<string>(Object.keys(HR_ANALYSIS))

export function isStoryPerson(personId: string): boolean {
  return STORY_PEOPLE.has(personId)
}

// 各模块的空态判定（缺数据模块走干净空态，不渲染占位灰条）。
export function hrSignalFor(personId: string, phase: DetailPhase = 'grown'): string | null {
  if (isBelieved(phase)) {
    if (personId === 'u_bill') return 'Raw workload: 134%'
    if (personId === 'u_jason') return 'Raw capacity: 70%'
    if (personId === 'u_vanessa') return 'Friday owner: dependency exposed'
    return null
  }
  return HR_SIGNAL[personId] ?? null
}

export function weeklySummaryFor(personId: string, phase: DetailPhase = 'grown'): WeeklySummary | null {
  if (isBelieved(phase)) return BELIEVED_WEEKLY_SUMMARY[personId] ?? null
  return WEEKLY_SUMMARY[personId] ?? null
}

export function hrAnalysisFor(personId: string, phase: DetailPhase = 'grown'): HrAnalysis | null {
  if (isBelieved(phase)) return BELIEVED_HR_ANALYSIS[personId] ?? null
  return HR_ANALYSIS[personId] ?? null
}

export interface EmployeeTaskView extends Task {
  note: string
}

const EMPLOYEE_TASK_OVERRIDES: Record<DetailPhase, Record<string, Partial<EmployeeTaskView>>> = {
  believed: {
    t_acme_hook: {
      title: 'Hook up Connector to Acme - stalled under interrupt load',
      note: 'Raw assignment pressure; no reroute yet.',
    },
    t_con_slack: {
      title: 'Slack ingest + rate-limit handling - stalled',
      note: 'Blocked signal visible; still assigned to Bill.',
    },
    t_con_gh: {
      title: 'GitHub webhook receiver - competing with Acme support',
      note: 'Moving, but support pulls are fragmenting focus.',
    },
    t_con_dedupe: {
      title: 'Event dedupe + hashing - waiting',
      note: 'Still on the original scope.',
    },
  },
  grown: {
    t_acme_hook: {
      title: 'Hook up Connector to Acme - protected core path',
      note: 'Bill focus protected; scope confirmation routes through Vanessa.',
    },
    t_con_slack: {
      title: 'Slack ingest + rate-limit handling - focus block',
      note: 'Primary protected task; decides Friday vs Tuesday contingency.',
    },
    t_con_gh: {
      title: 'GitHub webhook receiver - core Friday scope',
      note: 'Kept in the Friday core ship.',
    },
    t_con_dedupe: {
      title: 'Event dedupe + hashing - deferred out of Friday',
      status: 'todo',
      note: 'Non-core work moved to next week.',
    },
  },
}

export function tasksForPerson(personId: string, phase: DetailPhase = 'grown'): EmployeeTaskView[] {
  return TASKS.filter((task) => task.assigneeId === personId).map((task) => ({
    ...task,
    ...EMPLOYEE_TASK_OVERRIDES[phase][task.id],
    note:
      EMPLOYEE_TASK_OVERRIDES[phase][task.id]?.note ??
      (isBelieved(phase) ? 'Current assignment from the raw board.' : 'No generated change needed.'),
  }))
}

// ════════════════════════════════════════════════════════════════════════════
// P3-02 · Project 详情页内容 + 派生 helper（additive）
// ════════════════════════════════════════════════════════════════════════════

// ───────────────────────── Delivery milestones ────────────────────────────────
// Acme 直接渲染 fixtures.ts 的 TIMELINE.milestones（6 阶段，已带 state）。
// Connector 在此草拟（≥5 阶段）；其余项目无数据 → 模块走空态。
// state 与 TIMELINE 同口径：planned / replanned / held / deferred / conditional。

export interface Milestone {
  label: string
  when: string
  state: string
}

export interface ProjectBriefCopy {
  summary: string
  statusLabel: string
  progressLabel: string
  dependencyLabel?: string
}

const PROJECT_BRIEF_COPY: Record<DetailPhase, Record<string, ProjectBriefCopy>> = {
  believed: {
    p_acme: {
      summary:
        'Observed state: Friday is still the target, but the Connector dependency is exposed and no diagnosis has been generated.',
      statusLabel: 'at risk · dependency symptom',
      progressLabel: '72% complete · original plan',
      dependencyLabel: 'Depends on Connector - unresolved',
    },
    p_connector: {
      summary:
        'Observed state: Monday says on track, but Slack rate-limit and no-update signals say the Connector is at risk.',
      statusLabel: 'reported on track · signals at risk',
      progressLabel: '48% complete · stalled signals',
    },
  },
  grown: {
    p_acme: {
      summary:
        'Diagnosed state: Acme remains at risk, but the blocker is owned, Friday core ship is held, and actions are in flight.',
      statusLabel: 'at risk · diagnosed · Friday held',
      progressLabel: '72% complete · re-baselined',
      dependencyLabel: 'Depends on Connector - core scope protected',
    },
    p_connector: {
      summary:
        'Diagnosed state: Bill gets protected focus, Acme-support interrupts route to Jason, and non-core work leaves Friday scope.',
      statusLabel: 'at risk · diagnosed · actions in flight',
      progressLabel: '48% complete · focus route active',
    },
  },
}

// ⚠ 待 Danny 审字。Act1 原始计划：展示 stall，不展示 B8 后的 re-baseline。
const ACME_BELIEVED_MILESTONES: Milestone[] = [
  { label: 'Integration test suite', when: 'Wed', state: 'in-progress' },
  { label: 'Connector hookup for Acme', when: 'Thu', state: 'stalled' },
  { label: 'Acme UAT', when: 'Fri am', state: 'waiting' },
  { label: 'Pilot ship target', when: 'Fri', state: 'at-risk' },
]

const CONNECTOR_BELIEVED_MILESTONES: Milestone[] = [
  { label: 'GitHub webhook receiver', when: 'Wed', state: 'in-progress' },
  { label: 'Slack ingest + rate-limit handling', when: 'Thu', state: 'stalled' },
  { label: 'Connector ↔ Acme hookup', when: 'Thu pm', state: 'stalled' },
  { label: 'Event dedupe + hashing', when: 'Fri', state: 'waiting' },
]

// ⚠ 待 Danny 审字。Connector 的 re-baseline 计划（保住周五核心 ship）。
const CONNECTOR_MILESTONES: Milestone[] = [
  { label: 'GitHub webhook receiver', when: 'Wed', state: 'planned' },
  { label: 'Slack ingest + rate-limit handling', when: 'Thu', state: 'replanned' },
  { label: 'Connector ↔ Acme hookup', when: 'Thu pm', state: 'replanned' },
  { label: 'Core ingest ships (Slack + GitHub)', when: 'Fri', state: 'held' },
  { label: 'Event dedupe + hashing', when: 'Next week', state: 'deferred' },
  { label: 'Rate-limit contingency slip', when: 'Tue', state: 'conditional' },
]

// 渲染用：state → 标签 + 视觉 tone class（held / conditional / deferred 视觉可辨）。
export const MILESTONE_STATE_COPY: Record<string, { label: string; tone: string }> = {
  'at-risk': { label: 'At risk', tone: 'is-stalled' },
  'in-progress': { label: 'In progress', tone: 'is-planned' },
  planned: { label: 'Planned', tone: 'is-planned' },
  replanned: { label: 'Replanned', tone: 'is-replanned' },
  held: { label: 'Held', tone: 'is-held' },
  deferred: { label: 'Deferred', tone: 'is-deferred' },
  conditional: { label: 'Conditional', tone: 'is-conditional' },
  stalled: { label: 'Stalled', tone: 'is-stalled' },
  waiting: { label: 'Waiting', tone: 'is-conditional' },
}

// 时间排序键；未知 when 落到末尾（不破坏排序）。
const MILESTONE_WHEN_ORDER: Record<string, number> = {
  Wed: 0,
  Thu: 1,
  'Thu pm': 2,
  'Fri am': 3,
  Fri: 4,
  'Next week': 5,
  Tue: 6,
}

export function milestoneOrder(when: string): number {
  return MILESTONE_WHEN_ORDER[when] ?? 99
}

export function projectMilestones(projectId: string, phase: DetailPhase = 'grown'): Milestone[] | null {
  if (isBelieved(phase)) {
    if (projectId === 'p_acme') return ACME_BELIEVED_MILESTONES
    if (projectId === 'p_connector') return CONNECTOR_BELIEVED_MILESTONES
    return null
  }
  if (projectId === 'p_acme') return [...TIMELINE.milestones]
  if (projectId === 'p_connector') return CONNECTOR_MILESTONES
  return null
}

export function projectBriefFor(project: Project, phase: DetailPhase): ProjectBriefCopy {
  return (
    PROJECT_BRIEF_COPY[phase][project.id] ?? {
      summary: project.summary ?? 'No project summary yet.',
      statusLabel: project.status.replace('-', ' '),
      progressLabel: `${project.progress}% complete`,
      dependencyLabel: project.dependsOn?.length ? 'Dependencies attached' : undefined,
    }
  )
}

// ───────────────────────── Team responsibilities ──────────────────────────────
// owner + task assignees 派生的成员集合（owner 置顶，去重）。

export interface TeamMember {
  person: Person
  role: 'Owner' | 'Contributor'
  note: string
}

const PROJECT_TEAM_NOTES: Record<DetailPhase, Record<string, Record<string, string>>> = {
  believed: {
    p_acme: {
      u_vanessa: 'Owner · holding Friday target',
      u_kristen: 'Contributor · integration waits on Connector',
      u_bill: 'Contributor · still owns blocked hookup',
      u_aidy: 'Contributor · UAT waiting',
    },
    p_connector: {
      u_bill: 'Owner · still carrying Connector and Acme interrupts',
    },
  },
  grown: {
    p_acme: {
      u_vanessa: 'Owner · confirms trimmed Friday scope',
      u_kristen: 'Contributor · protects core UAT path',
      u_bill: 'Contributor · protected Connector focus',
      u_aidy: 'Contributor · UAT runs after core hookup',
    },
    p_connector: {
      u_bill: 'Owner · protected focus on rate-limit blocker',
    },
  },
}

export function projectTeam(projectId: string, phase: DetailPhase = 'grown'): TeamMember[] {
  const project = PROJECTS.find((p) => p.id === projectId)
  if (!project) return []
  const assigneeIds = TASKS.filter((task) => task.projectId === projectId).map(
    (task) => task.assigneeId,
  )
  const orderedIds = [project.ownerId, ...assigneeIds]
  const seen = new Set<string>()
  const team: TeamMember[] = []
  for (const id of orderedIds) {
    if (seen.has(id)) continue
    seen.add(id)
    const person = PEOPLE.find((p) => p.id === id)
    if (!person) continue
    const role = id === project.ownerId ? 'Owner' : 'Contributor'
    team.push({
      person,
      role,
      note: PROJECT_TEAM_NOTES[phase][projectId]?.[id] ?? `${role} · ${person.role}`,
    })
  }
  return team
}

// ───────────────────────── Task board（3 段映射）──────────────────────────────
// Task.status → 段：stalled → Needs decision · in-progress → In progress ·
// done + todo → Done or waiting。

export type TaskColumnKey = 'needs-decision' | 'in-progress' | 'done-waiting'

export interface TaskColumn {
  key: TaskColumnKey
  title: string
  statuses: Task['status'][]
}

export const TASK_BOARD_COLUMNS: TaskColumn[] = [
  { key: 'needs-decision', title: 'Needs decision', statuses: ['stalled'] },
  { key: 'in-progress', title: 'In progress', statuses: ['in-progress'] },
  { key: 'done-waiting', title: 'Done or waiting', statuses: ['done', 'todo'] },
]

export interface ProjectTaskView extends Task {
  note: string
}

const PROJECT_TASK_OVERRIDES: Record<DetailPhase, Record<string, Partial<ProjectTaskView>>> = {
  believed: {
    t_acme_int: {
      title: 'Integration test suite - blocked paths still pending',
      note: 'Raw progress; Connector-dependent coverage cannot close.',
    },
    t_acme_data: {
      title: 'Seed pilot demo data - original Friday prep',
      note: 'Current assignment; no scope trim yet.',
    },
    t_acme_hook: {
      title: 'Hook up Connector to Acme - stalled',
      note: 'Visible blocker; no replan generated.',
    },
    t_acme_uat: {
      title: 'UAT with Acme - waiting on hookup',
      note: 'Friday run exposed to Connector stall.',
    },
    t_con_slack: {
      title: 'Slack ingest + rate-limit handling - stalled',
      note: 'Repeated blocker still unresolved.',
    },
    t_con_gh: {
      title: 'GitHub webhook receiver - partial progress',
      note: 'Moving while Bill is interrupted.',
    },
    t_con_dedupe: {
      title: 'Event dedupe + hashing - original scope waiting',
      note: 'Still included in the visible plan.',
    },
  },
  grown: {
    t_acme_int: {
      title: 'Integration test suite - core path guarded',
      note: 'Tests aim at the trimmed Friday scope.',
    },
    t_acme_data: {
      title: 'Seed pilot demo data - Friday core only',
      note: 'Non-core Connector assumptions removed.',
    },
    t_acme_hook: {
      title: 'Hook up Connector to Acme - protected focus',
      note: 'Bill focus blocks assigned; Vanessa confirms scope.',
    },
    t_acme_uat: {
      title: 'UAT with Acme - queued after core hookup',
      note: 'Run waits for protected core ship, not original full scope.',
    },
    t_con_slack: {
      title: 'Slack ingest + rate-limit handling - action in flight',
      note: 'Protected focus task; decides contingency.',
    },
    t_con_gh: {
      title: 'GitHub webhook receiver - held in core ship',
      note: 'Kept as Friday core scope.',
    },
    t_con_dedupe: {
      title: 'Event dedupe + hashing - deferred',
      status: 'todo',
      note: 'Moved out of Friday scope.',
    },
  },
}

export function tasksForProject(projectId: string, phase: DetailPhase = 'grown'): ProjectTaskView[] {
  return TASKS.filter((task) => task.projectId === projectId).map((task) => ({
    ...task,
    ...PROJECT_TASK_OVERRIDES[phase][task.id],
    note:
      PROJECT_TASK_OVERRIDES[phase][task.id]?.note ??
      (isBelieved(phase) ? 'Raw board item; no generated action yet.' : 'No generated change needed.'),
  }))
}

// ───────────────────────── Handoffs（按 projectId）─────────────────────────────
// Handoff = agent 产出、可直接执行的单条行动（checklist：done / discard）。
// flyToNexus 非空 = 可一键飞回 Nexus 深挖（调 askQuestion(flyToNexus)）。
// ⚠ 待 Danny 审字。故事项目有；texture 项目无 → 模块空态。

export interface Handoff {
  id: string
  text: string
  detail?: string
  flyToNexus?: string // askQuestion 的问题文本
}

export const HANDOFFS: Record<string, Handoff[]> = {
  p_acme: [
    {
      id: 'h_acme_scope',
      text: 'Confirm the trimmed Connector scope with Bill today',
      detail: 'Ship Slack + GitHub core Friday; defer event-dedupe to next week.',
    },
    {
      id: 'h_acme_stakeholder',
      text: 'Pre-warn the Acme stakeholder that Tuesday is the held contingency',
      detail: 'Only triggers if the Slack rate-limit blocker is not cracked by Thursday.',
    },
    {
      id: 'h_acme_legal',
      text: 'Have Legal clear the trimmed-scope change against the Acme SOW',
      detail: 'Scope cut may touch the signed statement of work — route to a legal agent.',
      flyToNexus: 'Does the trimmed Connector scope for Friday stay within the Acme SOW?',
    },
  ],
  p_connector: [
    {
      id: 'h_con_offload',
      text: "Offload Bill's Acme-support interrupts to Jason for 2 days",
      detail: 'Jason is at 70% load and can absorb the support pulls short-term.',
    },
    {
      id: 'h_con_focus',
      text: 'Protect 2 uninterrupted focus blocks for Bill on the Connector',
    },
    {
      id: 'h_con_ratelimit',
      text: 'Spin up an agent to crack the Slack rate-limit blocker',
      detail: 'This single point decides Friday core ship vs the Tuesday slip.',
      flyToNexus: "What's the fastest path to crack the Slack API rate-limit blocker by Thursday?",
    },
  ],
}

export function handoffsForProject(projectId: string, phase: DetailPhase = 'grown'): Handoff[] {
  if (isBelieved(phase)) return []
  return HANDOFFS[projectId] ?? []
}

// ───────────────────────── Weekly team updates（按 projectId）──────────────────
// 本周成员进展。⚠ 待 Danny 审字。口径中性，描述工作进展非人事评价。

export interface WeeklyUpdate {
  personId: string
  update: string
}

export const WEEKLY_UPDATES: Record<string, WeeklyUpdate[]> = {
  p_acme: [
    { personId: 'u_vanessa', update: 'Locked the Friday scope and re-confirmed the Connector dependency end to end.' },
    { personId: 'u_kristen', update: 'Integration suite is green except the Connector-dependent paths.' },
    { personId: 'u_aidy', update: 'UAT plan is ready; waiting on the Connector hookup to start the run.' },
  ],
  p_connector: [
    { personId: 'u_bill', update: 'GitHub webhook receiver landed; Slack ingest is still blocked on rate limits.' },
    { personId: 'u_jason', update: 'Free to take the Acme-support load so the Connector can move again.' },
  ],
}

// ⚠ 待 Danny 审字。believed 态项目周更只陈列现场事实，不写 re-baseline / offload 决策。
export const BELIEVED_WEEKLY_UPDATES: Record<string, WeeklyUpdate[]> = {
  p_acme: [
    { personId: 'u_vanessa', update: 'Friday pilot scope is still the target; Connector hookup remains the exposed dependency.' },
    { personId: 'u_kristen', update: 'Integration suite is moving, but Connector-dependent paths cannot finish yet.' },
    { personId: 'u_aidy', update: 'UAT is waiting on the Connector hookup before the run can start.' },
  ],
  p_connector: [
    { personId: 'u_bill', update: 'GitHub webhook receiver is moving; Slack rate-limit handling is still stalled.' },
    { personId: 'u_jason', update: 'Billing v1 is steady at 30% progress; Jason is at 70% workload.' },
  ],
}

export function weeklyUpdatesForProject(projectId: string, phase: DetailPhase = 'grown'): WeeklyUpdate[] {
  if (isBelieved(phase)) return BELIEVED_WEEKLY_UPDATES[projectId] ?? []
  return WEEKLY_UPDATES[projectId] ?? []
}

// ───────────────────────── 次层级：Risk & evidence（过滤 SIGNALS）──────────────
// 下沉到主层级下方（护 B9b 之前的 reveal）。项目自身 + 其依赖项目的信号都纳入，
// 这样 Acme（依赖 Connector）也能看到完整证据链。texture 项目无信号 → 空态。

export function signalsForProject(projectId: string, phase: DetailPhase = 'grown'): Signal[] {
  const project = PROJECTS.find((p) => p.id === projectId)
  if (!project) return []
  const projectIds = new Set<string>([projectId, ...(project.dependsOn ?? [])])
  const taskIds = new Set(
    TASKS.filter((task) => projectIds.has(task.projectId)).map((task) => task.id),
  )
  // owner(s) 的 person-signal 也纳入 → "HR signal" 那半（Connector/Acme 都能追到 Bill 的 interrupt）。
  const ownerIds = new Set<string>(
    [...projectIds]
      .map((id) => PROJECTS.find((p) => p.id === id)?.ownerId)
      .filter((id): id is string => Boolean(id)),
  )
  return SIGNALS.filter(
    (signal) =>
      (signal.subjectType === 'project' && projectIds.has(signal.subjectId)) ||
      (signal.subjectType === 'task' && taskIds.has(signal.subjectId)) ||
      (signal.subjectType === 'person' && ownerIds.has(signal.subjectId)),
  )
}

export function reportMismatchForProject(projectId: string): {
  reported: string
  signalsSay: string
  gapType: string
  rootCause: string
  safeFraming: string
} | null {
  const projectIds = new Set<string>([projectId])
  const project = PROJECTS.find((p) => p.id === projectId)
  for (const depId of project?.dependsOn ?? []) projectIds.add(depId)
  if (!projectIds.has(MISMATCH.subjectProjectId)) return null
  return MISMATCH
}

// ════════════════════════════════════════════════════════════════════════════
// P3-04 · Capabilities sell 页（register B · 产品页 + moat banner）
// 吃既有 CAPABILITIES fixture（按 domain 分组）；此处只加页面框架文案 + 分组 helper。
// ⚠ 待 Danny 审字。呼应 CONTEXT 的 Capabilities「第二条腿」/ 护城河定义。
// ════════════════════════════════════════════════════════════════════════════

export const CAPABILITIES_PAGE = {
  eyebrow: 'Capabilities · the moat',
  title: 'The vertical playbooks behind every recommendation.',
  // moat banner 三点（proprietary / subscription / auto-cited）。
  moatPoints: [
    'Proprietary vertical playbooks',
    'Subscription',
    'Auto-cited in every recommendation',
  ],
  // 接回 pitch 命题的一句 framing（公司事实 vs Capabilities 的分工）。
  framing: 'Company facts say what happened; Capabilities say how to judge it.',
}

// CAPABILITIES 的 domain → 展示名（CONTEXT：库横跨 HR / Legal / PM / Finance / Ops / Sales）。
export const CAPABILITY_DOMAIN_LABEL: Record<string, string> = {
  'project-ops': 'PM',
  hr: 'HR',
  legal: 'Legal',
  finance: 'Finance',
  sales: 'Sales',
  ops: 'Ops',
}

// 库覆盖的垂直域展示顺序（coverage strip 用）。
export const CAPABILITY_DOMAIN_ORDER: string[] = [
  'hr',
  'project-ops',
  'legal',
  'finance',
  'ops',
  'sales',
]

export interface CapabilityPackage {
  domain: CapabilityEntry['domain']
  title: string
  gist: string
  previewPlaybooks: string[]
}

// ⚠ 待 Danny 审字：P4-03 新增 Venus-facing catalog / subscription copy。
// 订阅包不带 status 字段；默认 subscribed 由 loadedCapabilityDomains() 派生，保持 loaded ⇔ subscribed。
export const CAPABILITY_SUBSCRIPTION_COPY = {
  coverageEyebrow: 'Subscribed domains',
  coverageTitle: 'Your coverage',
  expandEyebrow: 'Available domains',
  expandTitle: 'Expand your coverage',
  subscribedBadge: 'Subscribed',
  availableBadge: 'Available',
  previewLabel: 'Preview playbooks',
  subscribeAction: 'Subscribe',
  unsubscribeAction: 'Unsubscribe',
  emptyCoverage: 'No domains subscribed in this local view.',
  emptyExpansion: 'All curated domains are subscribed.',
}

export const CAPABILITY_PACKAGES: CapabilityPackage[] = [
  {
    domain: 'hr',
    title: 'HR',
    gist: 'Workload, capacity, and manager-loop playbooks for neutral people-routing decisions.',
    previewPlaybooks: [
      'Low output vs. interrupt overload',
      'Capacity-aware overflow routing',
      'Manager check-in framing',
    ],
  },
  {
    domain: 'project-ops',
    title: 'PM',
    gist: 'Delivery-risk playbooks for dependencies, scope changes, and deadline tradeoffs.',
    previewPlaybooks: [
      'Cross-team dependency at risk near a deadline',
      'Scope trim near customer ship',
      'Contingency date framing',
    ],
  },
  {
    domain: 'legal',
    title: 'Legal',
    gist: 'Contract, scope, and approval playbooks for deciding when execution changes need legal review.',
    previewPlaybooks: [
      'Statement-of-work scope check',
      'Customer commitment exception',
      'Approval path for delivery changes',
    ],
  },
  {
    domain: 'finance',
    title: 'Finance',
    gist: 'Margin, billing, and budget playbooks that connect operational decisions to revenue exposure.',
    previewPlaybooks: [
      'Revenue-risk prioritization',
      'Budget owner escalation',
      'Margin impact of support load',
    ],
  },
  {
    domain: 'ops',
    title: 'Ops',
    gist: 'Operating cadence playbooks for incident handoffs, SLA pressure, and cross-functional queue health.',
    previewPlaybooks: [
      'SLA breach triage',
      'Queue ownership handoff',
      'Incident-to-project escalation',
    ],
  },
  {
    domain: 'sales',
    title: 'Sales',
    gist: 'Pipeline and account-risk playbooks that help agents weigh customer urgency against delivery focus.',
    previewPlaybooks: [
      'Expansion account save',
      'Renewal-risk signal routing',
      'Executive sponsor follow-up',
    ],
  },
]

// 按 domain 分组（保持 CAPABILITIES 出现顺序）。
export function capabilitiesByDomain(): {
  domain: string
  label: string
  entries: CapabilityEntry[]
}[] {
  const order: string[] = []
  const groups: Record<string, CapabilityEntry[]> = {}
  for (const cap of CAPABILITIES) {
    if (!groups[cap.domain]) {
      groups[cap.domain] = []
      order.push(cap.domain)
    }
    groups[cap.domain].push(cap)
  }
  return order.map((domain) => ({
    domain,
    label: CAPABILITY_DOMAIN_LABEL[domain] ?? domain,
    entries: groups[domain],
  }))
}

// demo 已加载 sample playbook 的域（= CAPABILITIES 里出现的 domain）。
export function loadedCapabilityDomains(): Set<string> {
  return new Set<string>(CAPABILITIES.map((cap) => cap.domain))
}

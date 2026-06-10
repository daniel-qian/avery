/**
 * TeamMaster 2.0 — Venus Pitch Demo Fixtures (draft v1, 2026-06-03)
 *
 * 这是 demo 的内容真相源（见 demo-brief.md §6）。
 * - 所有 user-facing 字符串用英文（Venus = 美国听众）；注释中文给 Danny。
 * - 按 ADR-0003：scripted 内容当 data 存，喂 dumb 组件；rail 与 free-click 共用。
 * - 本文件即 app 的 live fixtures（src/data/fixtures.ts）；导出的 types = state 数据契约。
 *   设计稿原在 docs/20260603-design/，已于 P0 scaffold 时迁来。
 *
 * 命名：虚构同事用 SNL 2012 黄金期 cast 名（好记）；You / Wang 保留真名（真创始人 = meta 点）。
 *
 * 高 narrative 价值、需你逐字审的块（其余 = orbit 纹理，可随手改名）：
 *   AGENT_OUTPUT（Venus 盯着读）· MISMATCH · BRIEFING_V1/V2 · CAPABILITIES。
 */

import { AVATAR_SPRITES, type AvatarSprite } from './avatarSprites'

// ───────────────────────── Types（即 state 数据契约）─────────────────────────

export type ProjectStatus = 'on-track' | 'at-risk' | 'blocked' | 'done'
export type SignalSource = 'slack' | 'github' | 'task' | 'manual'

export interface Person {
  id: string
  name: string
  lastInitial?: string // 名册名牌 "Firstname L."（ADR-0012 修订 5）；You/Wang 真名无姓缩写
  role: string
  team: 'Founders' | 'Eng' | 'Product' | 'Design' | 'GTM' | 'Ops'
  capacityPct?: number // 100 = 满载；>100 = 超载
  moodPct: number // 0..100；calm 卡 MP HUD
  avatarSprite: AvatarSprite
  storyCritical?: boolean
}

// 项目风险分布（Dashboard focus 态图表的 4 维，0..100）。手工编剧（守 ADR-0003：
// scripted 内容当 data 存），story-critical 项目按叙事调，其余给平静纹理。
export interface ProjectRisk {
  progress: number // 进度风险（落后/依赖拖累）
  blockers: number // 阻塞风险（卡点/外部依赖）
  staffing: number // 人力风险（过载/单点）
  quality: number // 质量风险
}

export interface Project {
  id: string
  title: string
  ownerId: string
  status: ProjectStatus // 系统判断的真实状态
  reportedStatus?: ProjectStatus // owner 自报（与 status 不一致 = report mismatch）
  progress: number // 0..100
  dueDate?: string
  dependsOn?: string[] // project ids
  summary?: string
  storyCritical?: boolean
  hotspot?: boolean // Dashboard「Hot spots」tag 手工标记；语义独立于 status
  risk?: ProjectRisk
}

export interface Task {
  id: string
  projectId: string
  title: string
  assigneeId: string
  status: 'todo' | 'in-progress' | 'stalled' | 'done'
}

export interface Signal {
  id: string
  source: SignalSource
  subjectType: 'person' | 'project' | 'task'
  subjectId: string
  summary: string
  ageDays: number
  // interrupt = 打断类信号（用于 HR 线区分"被打断"而非"低产"）
  tag?: 'stalled' | 'repeated-blocker' | 'no-update' | 'interrupt' | 'self-report'
}

export interface CapabilityEntry {
  id: string
  domain: 'project-ops' | 'hr' | 'legal' | 'finance' | 'sales' | 'ops'
  title: string
  gist: string // 一句话判断框架（agent 引用它）
}

export interface AgentOutput {
  // 可信产出报告的固定 6 段式
  conclusion: string
  evidence: string[]
  uncertainties: string[]
  recommendedActions: string[]
  needsConfirmationFrom: string[]
  nextTasks: TaskTemplate[]
}

export interface TaskTemplate {
  title: string
  assigneeId: string
  due: string
}

export interface Briefing {
  id: string
  version: 1 | 2
  tone: 'calm' | 'alert'
  headline: string
  subhead: string
  metrics: { label: string; value: string }[]
}

// Dashboard 顶部标签（P1）。curated 列表 + 声明式匹配规则；
// 选 tag → focus.ts 据 match 算"根集合"→ 同单点 relatedness 展开。多选 = 并集。
export interface DashboardTag {
  id: string
  label: string
  match:
    | { by: 'due'; within: 'this-week' } // 时间
    | { by: 'status'; status: ProjectStatus } // 属性
    | { by: 'project'; projectId: string } // 具体实体
    | { by: 'team'; team: Person['team'] } // 人群
    | { by: 'hotspot' } // Project.hotspot 标记
}

// ───────────────────────── People（~14；You/Wang 真名，其余 SNL）─────────────

export const PEOPLE: Person[] = [
  { id: 'u_you', name: 'You', role: 'Founder / CEO', team: 'Founders', capacityPct: 95, moodPct: 72, avatarSprite: AVATAR_SPRITES.paladin, storyCritical: true },
  { id: 'u_wang', name: 'Wang', role: 'Co-founder / Head of Domain', team: 'Founders', capacityPct: 90, moodPct: 80, avatarSprite: AVATAR_SPRITES.cleric, storyCritical: true },
  { id: 'u_vanessa', name: 'Vanessa', lastInitial: 'B', role: 'Product Manager', team: 'Product', capacityPct: 88, moodPct: 62, avatarSprite: AVATAR_SPRITES.archer, storyCritical: true },
  { id: 'u_bill', name: 'Bill', lastInitial: 'H', role: 'Backend Engineer', team: 'Eng', capacityPct: 134, moodPct: 24, avatarSprite: AVATAR_SPRITES.blacksmith, storyCritical: true }, // 超载（被打断）
  { id: 'u_jason', name: 'Jason', lastInitial: 'S', role: 'Backend Engineer', team: 'Eng', capacityPct: 70, moodPct: 76, avatarSprite: AVATAR_SPRITES.swordsman, storyCritical: true }, // 有余量 → 接 Bill 的活
  // ── orbit 纹理（名字可改）──
  { id: 'u_kristen', name: 'Kristen', lastInitial: 'W', role: 'Frontend Engineer', team: 'Eng', capacityPct: 92, moodPct: 68, avatarSprite: AVATAR_SPRITES.mage },
  { id: 'u_nasim', name: 'Nasim', lastInitial: 'P', role: 'ML Engineer', team: 'Eng', capacityPct: 85, moodPct: 74, avatarSprite: AVATAR_SPRITES.alchemist },
  { id: 'u_andy', name: 'Andy', lastInitial: 'S', role: 'Product Designer', team: 'Design', capacityPct: 80, moodPct: 78, avatarSprite: AVATAR_SPRITES.merchant },
  { id: 'u_kate', name: 'Kate', lastInitial: 'M', role: 'Customer Success Lead', team: 'GTM', capacityPct: 108, moodPct: 56, avatarSprite: AVATAR_SPRITES.farmer },
  { id: 'u_will', name: 'Will', lastInitial: 'F', role: 'Account Executive', team: 'GTM', capacityPct: 75, moodPct: 73, avatarSprite: AVATAR_SPRITES.thief },
  { id: 'u_cecily', name: 'Cecily', lastInitial: 'S', role: 'Growth / Marketing', team: 'GTM', capacityPct: 65, moodPct: 82, avatarSprite: AVATAR_SPRITES.kid },
  { id: 'u_kenan', name: 'Kenan', lastInitial: 'T', role: 'Operations', team: 'Ops', capacityPct: 60, moodPct: 79, avatarSprite: AVATAR_SPRITES.demon },
  { id: 'u_fred', name: 'Fred', lastInitial: 'A', role: 'Data Engineer', team: 'Eng', capacityPct: 78, moodPct: 70, avatarSprite: AVATAR_SPRITES.skeletonGeneral },
  { id: 'u_aidy', name: 'Aidy', lastInitial: 'B', role: 'QA Engineer', team: 'Eng', capacityPct: 82, moodPct: 69, avatarSprite: AVATAR_SPRITES.witch },
]

// ───────────────────────── Projects（~7）────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    id: 'p_acme',
    title: 'Acme Pilot',
    ownerId: 'u_vanessa',
    status: 'at-risk',
    progress: 72,
    dueDate: 'This Friday',
    dependsOn: ['p_connector'], // ← Friday 交付卡在 Connector 上
    summary: 'First design-partner pilot. Ships Friday. Blocked by the Connector dependency.',
    storyCritical: true,
    risk: { progress: 72, blockers: 64, staffing: 38, quality: 30 }, // 依赖 Connector 拖累进度/阻塞
  },
  {
    id: 'p_connector',
    title: 'Connector: Slack / GitHub',
    ownerId: 'u_bill',
    status: 'at-risk', // 系统判断
    reportedStatus: 'on-track', // ← Bill 自报，制造 report mismatch
    progress: 48,
    dueDate: 'This Thursday',
    summary: 'Slack + GitHub ingestion. Acme pilot depends on it.',
    storyCritical: true,
    hotspot: true, // briefing「1 hot spot」= 这里（mismatch / Bill 所在）
    risk: { progress: 62, blockers: 86, staffing: 74, quality: 42 }, // Bill 过载 + rate-limit 卡点
  },
  {
    id: 'p_pitch',
    title: 'Venus Pitch / Prototype 2.0',
    ownerId: 'u_you',
    status: 'on-track',
    progress: 80,
    dueDate: 'Today',
    summary: 'The very demo Venus is watching. 🙂', // 自指 wink
    risk: { progress: 22, blockers: 12, staffing: 30, quality: 18 },
  },
  {
    id: 'p_capabilities',
    title: 'Capabilities Build',
    ownerId: 'u_wang',
    status: 'on-track',
    progress: 55,
    summary: 'Proprietary vertical playbooks (HR / Project Ops / …). Subscription moat.',
    risk: { progress: 30, blockers: 18, staffing: 26, quality: 20 },
  },
  { id: 'p_designsys', title: 'Design System', ownerId: 'u_andy', status: 'on-track', progress: 64, risk: { progress: 24, blockers: 14, staffing: 22, quality: 26 } },
  { id: 'p_csonboard', title: 'CS Onboarding Revamp', ownerId: 'u_kate', status: 'on-track', progress: 40, risk: { progress: 36, blockers: 24, staffing: 48, quality: 22 } }, // Kate 108% load
  { id: 'p_billing', title: 'Billing v1', ownerId: 'u_jason', status: 'on-track', progress: 30, risk: { progress: 28, blockers: 18, staffing: 16, quality: 24 } },
]

// ───────────────────────── Tasks（聚焦 Acme + Connector）─────────────────────

export const TASKS: Task[] = [
  // Acme Pilot
  { id: 't_acme_int', projectId: 'p_acme', title: 'Integration test suite', assigneeId: 'u_kristen', status: 'in-progress' },
  { id: 't_acme_data', projectId: 'p_acme', title: 'Seed pilot demo data', assigneeId: 'u_vanessa', status: 'in-progress' },
  { id: 't_acme_hook', projectId: 'p_acme', title: 'Hook up Connector to Acme', assigneeId: 'u_bill', status: 'stalled' }, // ← 卡点
  { id: 't_acme_uat', projectId: 'p_acme', title: 'UAT with Acme', assigneeId: 'u_aidy', status: 'todo' },
  // Connector
  { id: 't_con_slack', projectId: 'p_connector', title: 'Slack ingest + rate-limit handling', assigneeId: 'u_bill', status: 'stalled' },
  { id: 't_con_gh', projectId: 'p_connector', title: 'GitHub webhook receiver', assigneeId: 'u_bill', status: 'in-progress' },
  { id: 't_con_dedupe', projectId: 'p_connector', title: 'Event dedupe + hashing', assigneeId: 'u_bill', status: 'todo' },
]

// ───────────────────────── Signals（reality gap 的证据链）────────────────────

export const SIGNALS: Signal[] = [
  { id: 's_pr', source: 'github', subjectType: 'project', subjectId: 'p_connector', summary: 'PR #142 (Slack ingest) open 6 days, no new commits', ageDays: 6, tag: 'stalled' },
  { id: 's_blocker', source: 'slack', subjectType: 'project', subjectId: 'p_connector', summary: '"Blocked on Slack API rate limits" raised 3 days running in #eng, unresolved', ageDays: 3, tag: 'repeated-blocker' },
  { id: 's_noupdate', source: 'task', subjectType: 'task', subjectId: 't_con_slack', summary: 'Connector tasks: 0 updates in 4 days', ageDays: 4, tag: 'no-update' },
  { id: 's_report', source: 'manual', subjectType: 'project', subjectId: 'p_connector', summary: 'Bill marked Connector "on track" in Monday standup', ageDays: 2, tag: 'self-report' },
  // ── 根因（HR 线）：Bill 不是低产，是被打断 ──
  { id: 's_mentions', source: 'slack', subjectType: 'person', subjectId: 'u_bill', summary: 'Bill @-mentioned 9× in 3 days in #acme-support to fight urgent customer issues', ageDays: 3, tag: 'interrupt' },
  { id: 's_commits', source: 'github', subjectType: 'person', subjectId: 'u_bill', summary: "This week's commits are mostly Acme hotfixes, not Connector work", ageDays: 2, tag: 'interrupt' },
]

// ───────────────────────── Capabilities（被 agent 自动优先引用）──────────────
// ⚠ 高价值：这是护城河的"内容证据"，建议你审字

export const CAPABILITIES: CapabilityEntry[] = [
  {
    id: 'cap_po_dep',
    domain: 'project-ops',
    title: 'Cross-team dependency at risk near a deadline',
    gist: 'When a downstream dependency shows stalled signals close to a ship date, surface the dependency and confirm its owner + scope first. Re-baseline or de-scope before adding people. Do not reassign blame.',
  },
  {
    id: 'cap_hr_interrupt',
    domain: 'hr',
    title: 'Low output vs. interrupt overload',
    gist: 'Before reading reduced task activity as performance, check interrupt load (mentions, support pulls, context-switching). If interrupts dominate, the fix is rebalancing load — not evaluation. Never infer performance from a single signal.',
  },
]

// ───────────────────────── Reality gap / Mismatch 卡 ─────────────────────────
// ⚠ 高价值：killer beat 的卡片内容

export const MISMATCH = {
  subjectPersonId: 'u_bill',
  subjectProjectId: 'p_connector',
  reported: 'On track (Monday standup)',
  signalsSay: 'At risk',
  gapType: 'report mismatch',
  evidenceSignalIds: ['s_pr', 's_blocker', 's_noupdate'],
  rootCause: 'Interrupt overload, not underperformance — Bill absorbed 9 Acme-support pulls in 3 days; his Connector work stalled as a result.',
  rootCauseSignalIds: ['s_mentions', 's_commits'],
  safeFraming: 'Evidence-based. This is a workload-routing issue, not a personnel judgment.',
}

// ───────────────────────── Nexus inspector（B4 / B6 / B7 轻量步）─────────────

const signalById = Object.fromEntries(SIGNALS.map((signal) => [signal.id, signal])) as Record<string, Signal>
const capabilityById = Object.fromEntries(
  CAPABILITIES.map((capability) => [capability.id, capability]),
) as Record<string, CapabilityEntry>

// P5-02 (ADR-0008)：B7 = in-thread Chat 对象。agent 发起、绑定单个决策、用完即合；
// agent 在场抛 evidence + Capabilities；产出沉淀进 report。
export interface HumanLoopMessage {
  id: string
  speaker: string
  role: 'human' | 'agent'
  agentKind?: 'pm' | 'hr'
  text: string
  reference?: string
}

// ⚠ 待 Danny 审字：B7 Chat transcript（Venus-facing 英文）。
const HUMAN_LOOP_MESSAGES: HumanLoopMessage[] = [
  {
    id: 'hl_pm_q',
    speaker: 'PM agent',
    role: 'agent',
    agentKind: 'pm',
    text: 'Bill — Connector PR #142 has had no commits for 6 days. Before we re-plan Friday: is the stall the Slack rate-limit work, or something else?',
    reference: 'Evidence · PR #142 · 6d no commits',
  },
  {
    id: 'hl_bill_reveal',
    speaker: 'Bill',
    role: 'human',
    text: "It's the rate-limit handling — but honestly I've barely touched it. I've been pulled into Acme-support fires all week, ~9 urgent asks in three days.",
  },
  {
    id: 'hl_hr_frame',
    speaker: 'HR agent',
    role: 'agent',
    agentKind: 'hr',
    text: 'That matches the signals: this reads as interrupt load, not output. Flagging the routing play — no performance read here.',
    reference: 'Capability · Interrupt-overload playbook',
  },
  {
    id: 'hl_you_decide',
    speaker: 'You',
    role: 'human',
    text: 'So if we take the Acme-support load off Bill, the Connector moves again?',
  },
  {
    id: 'hl_bill_commit',
    speaker: 'Bill',
    role: 'human',
    text: 'Yes. Give me two uninterrupted blocks and route the support pulls elsewhere for two days, and I can land the rate-limit work by Thursday.',
  },
  {
    id: 'hl_pm_plan',
    speaker: 'PM agent',
    role: 'agent',
    agentKind: 'pm',
    text: "Jason's at 70% with a clean week — routing the interrupts to him protects Friday's core ship. I'll re-baseline the plan now.",
    reference: 'Next · re-baselined timeline',
  },
]

export const HUMAN_LOOP = {
  title: 'Bill enters the loop',
  description:
    'The agent opens a chat with the people who can settle the call — agents stay in the room, bringing evidence and Capabilities.',
  messages: HUMAN_LOOP_MESSAGES,
}

export const NEXUS_INSPECTOR_CONTENT = {
  'pm-agent': {
    title: 'PM agent checks delivery evidence',
    body: 'Connector evidence is pulled from work systems, then matched against Company RAG and Project-Ops Capability guidance.',
    artifacts: [
      { label: 'Connector evidence · s_pr', detail: signalById.s_pr.summary },
      { label: 'Connector evidence · s_blocker', detail: signalById.s_blocker.summary },
      { label: 'Connector evidence · s_noupdate', detail: signalById.s_noupdate.summary },
      { label: 'Capability · cap_po_dep', detail: capabilityById.cap_po_dep.gist },
    ],
  },
  'hr-root-cause': {
    title: 'HR agent checks root cause',
    body: MISMATCH.rootCause,
    artifacts: [
      { label: 'Root cause', detail: 'Interrupt overload, not low output.' },
      { label: 'Interrupt signal · s_mentions', detail: signalById.s_mentions.summary },
      { label: 'Interrupt signal · s_commits', detail: signalById.s_commits.summary },
      { label: 'Capability · cap_hr_interrupt', detail: capabilityById.cap_hr_interrupt.gist },
      { label: 'Safe framing', detail: MISMATCH.safeFraming },
    ],
  },
  // P5-02：human-loop 已毕业到中央 ChatCard，inspector 不再承载（fallback 到 active-nodes）。
} as const

// ───────────────────────── Agent 结构化输出（6 段式）────────────────────────
// ⚠⚠ 最高价值：Venus 会逐字读这一段。请你审。

export const AGENT_OUTPUT: AgentOutput = {
  conclusion:
    'The Acme pilot is at risk for Friday — but it’s holdable. The blocker is the Connector dependency, stalled because Bill is absorbing Acme-support interrupts (not neglect). Clear his interrupts and trim non-core scope, and Friday still ships.',
  evidence: [
    'Acme ship depends on the Connector (hook-up task is stalled).',
    'Connector PR #142 has had no commits for 6 days.',
    '"Slack rate-limit" blocker raised 3 days running, unresolved.',
    'Connector tasks: 0 updates in 4 days — yet reported "on track" Monday.',
    'Bill was @-mentioned 9× in 3 days for Acme support; his commits this week are mostly Acme hotfixes.',
  ],
  uncertainties: [
    'Whether the Slack rate-limit blocker can be cracked by Thursday — this single point decides Friday vs the Tuesday contingency.',
    'Whether Acme would prefer a proactive Tuesday slip over a thinner Friday ship.',
  ],
  recommendedActions: [
    // 主方案：保住周五
    'Offload Bill’s Acme-support interrupts to Jason (70% load) for 2 days so he can focus the Connector.',
    'De-scope the Connector: ship core (Slack + GitHub ingest) Friday, defer event-dedupe to next week.',
    'Confirm the trimmed Connector scope today (Vanessa ↔ Bill).',
    // 兜底：绑定唯一变数
    'Contingency — only if the Slack rate-limit blocker isn’t cracked by Thursday: slip Acme Fri → Tue and tell the stakeholder today, not Friday night.',
  ],
  needsConfirmationFrom: ['You (founder) — the contingency slip call', 'Vanessa — Acme scope cut'],
  nextTasks: [
    { title: 'Take over Bill’s Acme-support interrupts for 2 days', assigneeId: 'u_jason', due: 'Today' },
    { title: 'Crack Slack rate-limit blocker (decides Friday vs Tue contingency)', assigneeId: 'u_bill', due: 'Thursday' },
    { title: 'Confirm trimmed Connector scope for a Friday core ship', assigneeId: 'u_vanessa', due: 'Today' },
  ],
}

// ───────────────────────── Timeline（B8 工具产出）──────────────────────────

export const TIMELINE = {
  title: 'Acme pilot — re-baselined to hold Friday',
  milestones: [
    { label: 'Connector core (Slack + GitHub ingest)', when: 'Thu', state: 'replanned' },
    { label: 'Connector ↔ Acme hookup', when: 'Thu pm', state: 'replanned' },
    { label: 'Acme UAT', when: 'Fri am', state: 'planned' },
    { label: 'Ship core', when: 'Fri', state: 'held' }, // ← 主方案的胜利点
    { label: 'Event dedupe', when: 'Next week', state: 'deferred' },
    { label: 'Slip to Tue', when: 'Tue', state: 'conditional' }, // 仅当 rate-limit 周四前解不掉才触发
  ],
}

// ───────────────────────── Briefings（B1 calm / B10 updated）────────────────
// ⚠ 高价值：开场与收尾的"组织天气"

export const BRIEFING_V1: Briefing = {
  id: 'b_v1',
  version: 1,
  tone: 'calm',
  headline: 'Acme pilot ships Friday. Org health looks steady.',
  subhead: 'One quiet hot-spot sits near the Connector dependency.',
  metrics: [
    { label: 'health', value: '82%' },
    { label: 'active projects', value: '7' },
    { label: 'hot spots', value: '1' },
  ],
}

export const BRIEFING_V2: Briefing = {
  id: 'b_v2',
  version: 2,
  tone: 'alert', // 仍非 calm：风险是真的，只是已被看见并接管
  headline: 'Acme still ships Friday — the hidden risk is caught and owned.',
  subhead: 'Root cause was interrupt overload, not a delivery slip. Bill’s interrupts moved to Jason · scope trimmed · 3 actions in flight · Tuesday held as contingency.',
  metrics: [
    { label: 'health', value: '82%' }, // 不再是"乐观盲值"，而是已校验、风险已 owned
    { label: 'risks owned', value: '1' },
    { label: 'actions in flight', value: '3' },
  ],
}

// ───────────────────────── Onboarding（B0 prologue）─────────────────────────

export const ONBOARDING = {
  sampleFiles: [
    { name: 'TeamMaster_Company_Handbook.pdf', kind: 'pdf' },
    { name: 'Acme_Pilot_SOW.docx', kind: 'docx' },
    { name: 'Team_Roster.csv', kind: 'csv' },
    { name: 'Q3_Roadmap.md', kind: 'md' },
  ],
  parsedInto: ['Company profile', 'Team roster (14 people)', '7 active projects', 'Recent work signals'],
  capabilitiesMatched: ['Project Ops playbooks', 'HR playbooks'], // 自动优先
  caption: 'TeamMaster reads your files, builds the company brain, and auto-loads the right Capabilities.',
}

// ───────────────────────── Dashboard tags（B1/B2 自由交互，最多 5）─────────────

export const DASHBOARD_TAGS: DashboardTag[] = [
  { id: 'tag_week', label: 'This week', match: { by: 'due', within: 'this-week' } },
  { id: 'tag_risk', label: 'At risk', match: { by: 'status', status: 'at-risk' } },
  { id: 'tag_acme', label: 'Acme Pilot', match: { by: 'project', projectId: 'p_acme' } },
  { id: 'tag_eng', label: 'Engineering', match: { by: 'team', team: 'Eng' } },
  { id: 'tag_hot', label: 'Hot spots', match: { by: 'hotspot' } },
]

// ───────────────────────── Hero 问题（B3 composer）──────────────────────────

export const HERO_QUESTION = 'Are we on track to ship the Acme pilot this Friday?'

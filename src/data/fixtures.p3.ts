/**
 * TeamMaster 2.0 — P3 详情页内容 fixtures（draft v1, 2026-06-04）
 *
 * P3 详情页（员工 / 项目）独有内容 + 派生 helper 的真相源。
 * - additive：只 import 共享 fixtures.ts，绝不修改它（P1/P2 也读共享 fixtures）。
 * - 所有 user-facing 字符串英文（Venus = 美国听众）；注释中文给 Danny。
 * - 派生 helper 是纯函数吃 fixtures，零新 store state（ADR-0005：详情页静态恒显）。
 *
 * ⚠ 待 Danny 审字：下方所有英文 copy 是 Danny 初稿，P3-05 收口逐字审。
 * ⚠ 守则：HR analysis / weekly sentiment 口径守 *no personnel judgment*
 *         （见 fixtures.ts 的 cap_hr_interrupt / MISMATCH.safeFraming）。
 */

import { PROJECTS, SIGNALS, type Project, type Signal } from './fixtures'

// ───────────────────────── 派生 helper（纯函数 · 零新 store state）─────────────

export type WorkloadStatus = 'Overloaded' | 'Steady' | 'Has capacity'

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

// 挂在某人身上的工作信号（subjectType === 'person'）。Bill = 两条 interrupt 证据；
// texture 人 = []（HR analysis 模块据此判断是否渲染 evidence 子段）。
export function signalsFor(personId: string): Signal[] {
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

export const WEEKLY_SUMMARY: Record<string, WeeklySummary> = {
  u_bill: {
    text: "Most of Bill's week went to Acme-support firefighting — nine urgent pulls in three days. Connector work stalled as a result, not from lack of effort.",
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
  capabilityId: string // 引用的 capability（auto-prioritized 护城河）
  reading: string // agent 对处境的中性解读
  recommendations: string[] // 低风险下一步
  framing: string // 显式的 no-personnel-judgment 护栏
}

export const HR_ANALYSIS: Record<string, HrAnalysis> = {
  u_bill: {
    capabilityId: 'cap_hr_interrupt',
    reading:
      'Reduced Connector output lines up with interrupt load, not performance. Bill absorbed nine Acme-support pulls in three days; the stall is a routing problem, not a capability one.',
    recommendations: [
      'Route incoming Acme-support interrupts to someone with capacity for two days so Bill can focus the Connector.',
      'Protect two uninterrupted focus blocks this week and confirm the trimmed Connector scope with him.',
      'Hold a low-key manager check-in to confirm load — frame it as rebalancing, not review.',
    ],
    framing: 'Evidence-based workload routing. No personnel judgment is implied.',
  },
  u_jason: {
    capabilityId: 'cap_hr_interrupt',
    reading:
      'Jason is running below full load with a clean signal picture — a natural candidate to absorb short-term overflow without risking burnout.',
    recommendations: [
      'Offer Jason the Acme-support interrupts for two days to unblock the Connector.',
      'Keep the handoff time-boxed so Billing v1 stays on track.',
    ],
    framing: 'Capacity-based routing suggestion. No personnel judgment is implied.',
  },
  u_vanessa: {
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
export function hrSignalFor(personId: string): string | null {
  return HR_SIGNAL[personId] ?? null
}

export function weeklySummaryFor(personId: string): WeeklySummary | null {
  return WEEKLY_SUMMARY[personId] ?? null
}

export function hrAnalysisFor(personId: string): HrAnalysis | null {
  return HR_ANALYSIS[personId] ?? null
}

import type { Pos } from './board'
import { HERO_QUESTION } from './fixtures'

// P6-01 contract pass（ADR-0013 决策 2）：case = per-case 定义数据形。
// 每个 case 自带：节点 + 边拓扑（lane/row 公式坐标）、编排步骤表、step labels、
// per-step 点亮节点集、Manifest 堆叠（产出圆 + 卡锚点公式）、follow-up 段、每步 context-%。
// bill/acme 是第一个迁入的 case（重型 hero：9 节点 / 6 步 / 4 manifest，行为零变）；
// errand cases（web-search P6-05 / email P6-06）在此注册表追加自己的定义，不碰 store。
// 坐标仍全公式（lane/row + 堆叠公式），守 memory: prefer-runtime-navigation-over-handtuned-layout。
//
// 注意：「Case」是 demo/工程词汇，不进 CONTEXT.md glossary——真实用户只看见 Thread（ADR-0013 后果）。

export type CaseId = string

export type NexusNodeId = string

// step kind 的全集 = 各 case 编排表的并集。bill/acme 六步对应 beat sheet B4–B9；
// 'follow-up-alternatives' 是 bill/acme follow-up 段的步骤（内容/卡渲染归 P6-03）。
// errand cases 在此追加自己的 kind（数据扩展，不碰 store 契约）。
export type ThreadStepKind =
  | 'pm-agent' // B4 PM agent 取证据 + Company RAG + Capabilities
  | 'cross-check' // B5 戳穿 reality gap（MISMATCH 卡）
  | 'hr-root-cause' // B6 HR agent 解释根因（bandwidth 打断非低产）
  | 'human-loop' // B7 拉真人 + agent 背景聆听
  | 'timeline' // B8 agent 调 tool 造 TIMELINE
  | 'structured-output' // B9 6 段式可信输出（AGENT_OUTPUT）
  | 'follow-up-alternatives' // bill/acme follow-up：Jason 替代人选分析（P6-03 渲染）
  // web-search errand case（P6-05，ADR-0013 决策 3）——数据扩展，不碰 store 契约：
  | 'web-search' // agent 调 web tool 查 Apple 政策（浏览器预览卡显形）
  | 'policy-gist' // agent 的实际回答：guideline 要点引文 + 回链 URL（gist 卡）
  | 'follow-up-compliance' // follow-up：Acme companion build 合规判定（短 Manifest）

export interface NexusNode {
  id: NexusNodeId
  kind: string
  label: string
  detail: string
}

export interface NexusEdge {
  id: string
  from: NexusNodeId
  to: NexusNodeId
  step: ThreadStepKind
}

export interface CardAnchor {
  pos: Pos
  half: { w: number; h: number }
}

// follow-up 段（ADR-0013 决策 5）：chip 锚在某张 Manifest 卡上；点 chip / composer 提问
// → askFollowUp(text) 把 steps 追加进该 thread 的编排表，无参 runAgent() 继续走。
export interface FollowUpSegment {
  id: string
  anchorStep: ThreadStepKind // chip 锚定的 manifest 卡（P6-03 渲染 chip）
  suggestedQuestion: string // chip 文本（自由文本 composer 可覆盖显示文本）
  steps: ThreadStepKind[] // 追加进 thread 编排表的步骤
}

export interface CaseDefinition {
  id: CaseId
  title: string // thread chrome 短名（P6-02 tab strip / history）
  question: string // 该 case 的默认问题文本（openThread 预填）
  nodes: NexusNode[]
  nodeOrder: NexusNodeId[]
  pos: Record<NexusNodeId, Pos>
  edges: NexusEdge[]
  orchestration: ThreadStepKind[] // 主段；follow-up 段经 askFollowUp 追加
  stepLabels: Record<string, string>
  stepNodes: Record<string, NexusNodeId[]> // 每步点亮的节点簇（节点态派生 + 镜头 bbox）
  stepContextPct: Record<string, number> // 每步脚本化 context-%（P6-04 HUD 纯派生）
  manifestProducers: Partial<Record<string, NexusNodeId>> // 卡 ← 产出圆（修订 6 语法）
  manifestNodeId: NexusNodeId // 链终点报告产出圆（calm 起 ghost 在场）
  manifestLabelPos: Pos
  cardAnchors: Partial<Record<string, CardAnchor>>
  followUps: FollowUpSegment[]
}

// ── 公式工具：lane/row → board 坐标；Manifest 堆叠 → 卡锚点。新 case 复用，不逐节点手摆。──

export function laneRowPositions<L extends string>(
  laneX: Record<L, number>,
  top: number,
  rowStep: number,
  placement: Record<NexusNodeId, { lane: L; row: number }>,
): Record<NexusNodeId, Pos> {
  return Object.fromEntries(
    Object.entries(placement).map(([id, p]) => {
      const { lane, row } = p as { lane: L; row: number }
      return [id, { x: laneX[lane], y: top + row * rowStep }]
    }),
  )
}

export function buildManifestStack(
  left: number,
  top: number,
  gap: number,
  stack: Array<[ThreadStepKind, { w: number; h: number }]>,
): Partial<Record<string, CardAnchor>> {
  const anchors: Partial<Record<string, CardAnchor>> = {}
  let stackY = top
  for (const [step, half] of stack) {
    anchors[step] = { pos: { x: left + half.w, y: stackY + half.h }, half }
    stackY += half.h * 2 + gap
  }
  return anchors
}

// ════════════════════════════════════════════════════════════════════════════
// bill/acme hero case（原 nexusLayout.ts + store ORCHESTRATION + NexusScene STEP_LABELS 迁入）
// ════════════════════════════════════════════════════════════════════════════

// P5 ⑦ (ADR-0012 修订 5+6)：三条固定竖向 lane，链视觉笔直：
// 左 lane = PM 链（pm-agent / project-ops-cap / tool）、中脊 = 共享节点
// （question → evidence → bill → output）、右 lane = HR 链（hr-agent / hr-cap）。
// 修订 6：链压窄成左侧细带，右侧大头留给 Manifest 列。
const BILL_ACME_LANE_X = { pm: 420, spine: 700, hr: 980 } as const
const BILL_ACME_FLOW_TOP = 300
const BILL_ACME_ROW_STEP = 320

// Manifest 列（修订 5+6）：结果卡按 step 顺序在右侧累积堆叠、左缘对齐；
// 锚点 y 由 half + 间隙公式推出。half = 估算半宽/半高，仅供镜头 bbox 与堆叠间距。
const BILL_ACME_MANIFEST_LEFT = 1240
const BILL_ACME_MANIFEST_TOP = 320
const BILL_ACME_MANIFEST_GAP = 90

export const BILL_ACME_CASE_ID: CaseId = 'bill-acme'

export const BILL_ACME_CASE: CaseDefinition = {
  id: BILL_ACME_CASE_ID,
  title: 'Bill & the Acme pilot', // ⚠ 待 Danny 审字（P6-02 tab 短名）
  question: HERO_QUESTION,

  nodes: [
    {
      id: 'question',
      kind: 'Question',
      label: 'Acme ship risk',
      detail: 'Manager asks what the system should verify.',
    },
    {
      id: 'pm-agent',
      kind: 'PM agent',
      label: 'Delivery path',
      detail: 'Checks dependencies, status, scope, and deadline pressure.',
    },
    {
      id: 'hr-agent',
      kind: 'HR agent',
      label: 'Workload cause',
      detail: 'Separates output signals from interruption load.',
    },
    {
      id: 'evidence',
      kind: 'Evidence',
      label: 'Signal cluster',
      detail: 'Slack, GitHub, tasks, and reported status.',
    },
    {
      id: 'project-ops-cap',
      kind: 'Project-Ops cap',
      label: 'Dependency playbook',
      detail: 'Deadline risk framing before reassignment.',
    },
    {
      id: 'hr-cap',
      kind: 'HR cap',
      label: 'Interrupt overload',
      detail: 'Do not infer performance from a single stalled signal.',
    },
    {
      id: 'bill',
      kind: 'Bill',
      label: 'Human loop',
      detail: 'Owner enters the thread while agents keep listening.',
    },
    {
      id: 'tool',
      kind: 'Tool',
      label: 'Timeline builder',
      detail: 'Re-baselines the plan against the Friday ship.',
    },
    {
      id: 'output',
      kind: 'Output',
      label: 'Structured report',
      detail: 'Conclusion, evidence, uncertainty, actions, confirmations.',
    },
  ],

  nodeOrder: [
    'question',
    'pm-agent',
    'hr-agent',
    'evidence',
    'project-ops-cap',
    'hr-cap',
    'bill',
    'tool',
    'output',
  ],

  pos: laneRowPositions(BILL_ACME_LANE_X, BILL_ACME_FLOW_TOP, BILL_ACME_ROW_STEP, {
    question: { lane: 'spine', row: 0 },
    'pm-agent': { lane: 'pm', row: 1 },
    'hr-agent': { lane: 'hr', row: 1 },
    evidence: { lane: 'spine', row: 2 },
    'project-ops-cap': { lane: 'pm', row: 3 },
    'hr-cap': { lane: 'hr', row: 3 },
    bill: { lane: 'spine', row: 4 },
    tool: { lane: 'pm', row: 5 },
    output: { lane: 'spine', row: 6 },
  }),

  edges: [
    { id: 'question-pm', from: 'question', to: 'pm-agent', step: 'pm-agent' },
    { id: 'pm-evidence', from: 'pm-agent', to: 'evidence', step: 'pm-agent' },
    { id: 'evidence-project-ops', from: 'evidence', to: 'project-ops-cap', step: 'pm-agent' },
    { id: 'project-ops-pm', from: 'project-ops-cap', to: 'pm-agent', step: 'cross-check' },
    { id: 'evidence-bill', from: 'evidence', to: 'bill', step: 'cross-check' },
    { id: 'question-hr', from: 'question', to: 'hr-agent', step: 'hr-root-cause' },
    { id: 'hr-bill', from: 'hr-agent', to: 'bill', step: 'hr-root-cause' },
    { id: 'bill-hr-cap', from: 'bill', to: 'hr-cap', step: 'hr-root-cause' },
    { id: 'hr-cap-hr', from: 'hr-cap', to: 'hr-agent', step: 'hr-root-cause' },
    { id: 'bill-pm', from: 'bill', to: 'pm-agent', step: 'human-loop' },
    { id: 'pm-tool', from: 'pm-agent', to: 'tool', step: 'timeline' },
    { id: 'hr-tool', from: 'hr-agent', to: 'tool', step: 'timeline' },
    { id: 'tool-output', from: 'tool', to: 'output', step: 'structured-output' },
    { id: 'evidence-output', from: 'evidence', to: 'output', step: 'structured-output' },
  ],

  // 主段编排（原 store ORCHESTRATION）。free-click 每调一次 runAgent 推进一步；
  // 这是 scripted data，不是分支逻辑（零 if(demoMode)）。
  orchestration: [
    'pm-agent',
    'cross-check',
    'hr-root-cause',
    'human-loop',
    'timeline',
    'structured-output',
  ],

  stepLabels: {
    'pm-agent': 'PM agent checks delivery evidence',
    'cross-check': 'Reality gap cross-check',
    'hr-root-cause': 'HR agent checks root cause',
    'human-loop': 'Bill enters the loop',
    timeline: 'Tool builds the re-baselined timeline',
    'structured-output': 'Structured output is ready',
    'follow-up-alternatives': 'PM agent re-checks alternatives for Jason', // ⚠ 待 Danny 审字
  },

  // 每步点亮的节点簇（原 lib/nexusFlow NEXUS_STEP_NODES）。follow-up 段重新点亮既有节点
  //（ADR-0013 决策 5：bill/acme 不加新节点——"同一条 thread 把活重新拾起来"才是故事）。
  stepNodes: {
    'pm-agent': ['question', 'pm-agent', 'evidence', 'project-ops-cap'],
    'cross-check': ['pm-agent', 'evidence', 'project-ops-cap', 'bill'],
    'hr-root-cause': ['hr-agent', 'bill', 'hr-cap', 'evidence'],
    'human-loop': ['bill', 'pm-agent', 'hr-agent'],
    timeline: ['tool', 'pm-agent', 'hr-agent', 'bill'],
    'structured-output': ['output', 'tool', 'evidence', 'pm-agent', 'hr-agent'],
    'follow-up-alternatives': ['pm-agent', 'project-ops-cap', 'output'],
  },

  // 每步脚本化 context-%（ADR-0013 决策 7，P6-04 HUD 纯派生）：重步骤可见地多耗
  //（human chat / report 占大头），主段收在 ~71%，follow-up 推到 ~80%。
  stepContextPct: {
    'pm-agent': 8,
    'cross-check': 19,
    'hr-root-cause': 31,
    'human-loop': 47,
    timeline: 58,
    'structured-output': 71,
    'follow-up-alternatives': 80,
  },

  // 修订 6：per-artifact 产出圆——产物各自从「产出节点」显形，卡连线源自自己的产出圆。
  manifestProducers: {
    'cross-check': 'evidence', // Reality Gap ← 信号簇
    'human-loop': 'bill', // human chat ← Bill 入环
    timeline: 'tool', // 重排时间线 ← Timeline builder
    'structured-output': 'output', // 决策报告 ← output
    'follow-up-alternatives': 'output', // 备选人选分析 ← output（P6-03 渲染卡内容）
  },

  // output 节点 = 链终点的「报告产出圆」，calm 起就以 ghost 在场（修订 5 语义保留）。
  manifestNodeId: 'output',

  manifestLabelPos: { x: BILL_ACME_MANIFEST_LEFT + 400, y: 210 },

  cardAnchors: buildManifestStack(
    BILL_ACME_MANIFEST_LEFT,
    BILL_ACME_MANIFEST_TOP,
    BILL_ACME_MANIFEST_GAP,
    [
      ['cross-check', { w: 380, h: 330 }],
      ['human-loop', { w: 360, h: 380 }],
      ['timeline', { w: 425, h: 350 }],
      ['structured-output', { w: 475, h: 460 }],
      // follow-up 卡落列底（P6-03 渲染内容；半宽 ≤ structured-output → calm bbox 不变）。
      ['follow-up-alternatives', { w: 400, h: 300 }],
    ],
  ),

  // bill/acme follow-up showcase（ADR-0013 决策 5；chip/卡渲染归 P6-03）。
  followUps: [
    {
      id: 'jason-alternatives',
      anchorStep: 'structured-output',
      suggestedQuestion: 'I have a job for Jason — is there any alternative?', // ⚠ 待 Danny 审字
      steps: ['follow-up-alternatives'],
    },
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// web-search errand case（P6-05，ADR-0013 决策 3）：Apple expedited-review 政策查询。
// 短链证"日常主力"——question → research agent → web tool（产出圆），2 步主段 +
// 1 步 follow-up 合规判定；context-% 收在 ~15%，与 hero 的 ~71% 在画板上形成可见对比。
// 浏览器预览卡 = fixture 截图（public/apple-app-review-guidelines.png）+ 真实 URL 栏，
// 否决 live iframe（Apple 发 X-Frame-Options/CSP + 会场断网风险）；零运行时网络依赖。
// ════════════════════════════════════════════════════════════════════════════

// 单 spine lane：errand 链笔直向下；Manifest 列紧贴右侧（卡比 hero 的窄）。
const WEB_SEARCH_LANE_X = { spine: 620 } as const
const WEB_SEARCH_FLOW_TOP = 360
const WEB_SEARCH_ROW_STEP = 340

const WEB_SEARCH_MANIFEST_LEFT = 1060
const WEB_SEARCH_MANIFEST_TOP = 300
const WEB_SEARCH_MANIFEST_GAP = 90

export const WEB_SEARCH_CASE_ID: CaseId = 'web-search-apple-policy'

// 浏览器预览卡 URL 栏显示的真实地址（可核）；截图资产即该页的高清长图。
export const APPLE_POLICY_URL = 'https://developer.apple.com/app-store/review/guidelines/'
export const APPLE_POLICY_URL_DISPLAY = 'developer.apple.com/app-store/review/guidelines/'
export const APPLE_POLICY_SCREENSHOT = '/apple-app-review-guidelines.png'

export const WEB_SEARCH_CASE: CaseDefinition = {
  id: WEB_SEARCH_CASE_ID,
  title: 'Apple review policy', // ⚠ 待 Danny 审字（tab 短名）
  // ADR-0013 决策 3 原文——resolveCaseForQuestion 精确匹配此文本进本 case 的 thread。
  question:
    "We're shipping the Acme companion app — what's Apple's policy on expedited App Review?", // ⚠ 待 Danny 审字

  nodes: [
    {
      id: 'question',
      kind: 'Question',
      label: 'Apple review policy', // ⚠ 待 Danny 审字
      detail: 'What does Apple require for an expedited App Review?', // ⚠ 待 Danny 审字
    },
    {
      id: 'research-agent',
      kind: 'Research agent', // ⚠ 待 Danny 审字
      label: 'Policy lookup', // ⚠ 待 Danny 审字
      detail: 'Scopes the question and queries Apple developer documentation.', // ⚠ 待 Danny 审字
    },
    {
      id: 'web-tool',
      kind: 'Web tool', // ⚠ 待 Danny 审字
      label: 'developer.apple.com',
      detail: 'Opens the official App Review guidelines page.', // ⚠ 待 Danny 审字
    },
  ],

  nodeOrder: ['question', 'research-agent', 'web-tool'],

  pos: laneRowPositions(WEB_SEARCH_LANE_X, WEB_SEARCH_FLOW_TOP, WEB_SEARCH_ROW_STEP, {
    question: { lane: 'spine', row: 0 },
    'research-agent': { lane: 'spine', row: 1 },
    'web-tool': { lane: 'spine', row: 2 },
  }),

  edges: [
    { id: 'question-agent', from: 'question', to: 'research-agent', step: 'web-search' },
    { id: 'agent-web-tool', from: 'research-agent', to: 'web-tool', step: 'web-search' },
  ],

  // 短链主段：2 步（errand 深度，ADR-0013 决策 2——否决等重编排）。
  orchestration: ['web-search', 'policy-gist'],

  stepLabels: {
    'web-search': 'Agent searches Apple developer docs', // ⚠ 待 Danny 审字
    'policy-gist': 'Policy gist is ready', // ⚠ 待 Danny 审字
    'follow-up-compliance': 'Agent checks the Acme build against the guidelines', // ⚠ 待 Danny 审字
  },

  stepNodes: {
    'web-search': ['question', 'research-agent', 'web-tool'],
    'policy-gist': ['research-agent', 'web-tool'],
    // follow-up 重新点亮既有节点（决策 5）——同一条 thread 把活重新拾起来。
    'follow-up-compliance': ['research-agent', 'web-tool'],
  },

  // errand thread 的低 context-%（决策 7）：主段收在 ~15%，follow-up 推到 ~23%——
  // 与 hero 的 71%/80% 成对比，"thread 是真实会话边界"可被看见。
  stepContextPct: {
    'web-search': 8,
    'policy-gist': 15,
    'follow-up-compliance': 23,
  },

  // 产出圆语法（修订 6）：预览卡 ← web tool（搜索引擎给页面）；gist / 合规判定 ←
  // research agent（agent 的实际回答——是 agent 不是搜索引擎的证据）。
  manifestProducers: {
    'web-search': 'web-tool',
    'policy-gist': 'research-agent',
    'follow-up-compliance': 'research-agent',
  },

  // 链终点产出圆 = web tool（calm 起 ghost 在场，修订 5 语义）。
  manifestNodeId: 'web-tool',

  manifestLabelPos: { x: WEB_SEARCH_MANIFEST_LEFT + 330, y: 210 },

  cardAnchors: buildManifestStack(
    WEB_SEARCH_MANIFEST_LEFT,
    WEB_SEARCH_MANIFEST_TOP,
    WEB_SEARCH_MANIFEST_GAP,
    [
      ['web-search', { w: 330, h: 420 }], // 浏览器预览卡（卡内可滚动看长图）
      ['policy-gist', { w: 330, h: 300 }],
      ['follow-up-compliance', { w: 330, h: 230 }],
    ],
  ),

  // follow-up showcase（决策 5）：chip 锚在 gist 卡。
  followUps: [
    {
      id: 'acme-compliance',
      anchorStep: 'policy-gist',
      suggestedQuestion: 'Does our current Acme companion build comply with this?', // ⚠ 待 Danny 审字
      steps: ['follow-up-compliance'],
    },
  ],
}

// ── case 注册表：P6-06（email errand）在此追加 case 定义（数据扩展，不碰 store 契约）。──

export const DEFAULT_CASE_ID: CaseId = BILL_ACME_CASE_ID

export const CASES: Record<CaseId, CaseDefinition> = {
  [BILL_ACME_CASE_ID]: BILL_ACME_CASE,
  [WEB_SEARCH_CASE_ID]: WEB_SEARCH_CASE,
}

// askQuestion 的 case 解析（ADR-0013：askQuestion 变 case-aware）：问题文本精确命中某 case
// 的默认问题 → 进该 case 的 thread；其余任意文本（自由 composer / handoff flyToNexus）
// 落 hero case——与今日单 thread 行为同构，ADR-0001 prototype 范围内诚实。
export function resolveCaseForQuestion(text: string): CaseId {
  const hit = Object.values(CASES).find((c) => c.question === text)
  return hit ? hit.id : DEFAULT_CASE_ID
}

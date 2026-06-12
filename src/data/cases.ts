import type { Pos } from './board'
import { HERO_QUESTION } from './fixtures'

// P6-01 contract pass（ADR-0013 决策 2）：case = per-case 定义数据形。
// feat-004 (ADR-0014)：节点链表达退役——nodes/edges/stepNodes/manifestProducers 等
// 拓扑字段连同数据删除；新增 `stream`：每 step 一组终端流行（全著作脚本），左栏
// 终端 HUD 逐拍打印。Manifest 卡列留在画板，锚点改双列瀑布公式。
// 坐标仍全公式（瀑布列），守 memory: prefer-runtime-navigation-over-handtuned-layout。
//
// 注意：「Case」是 demo/工程词汇，不进 CONTEXT.md glossary——真实用户只看见 Thread（ADR-0013 后果）。

export type CaseId = string

// step kind 的全集 = 各 case 编排表的并集。bill/acme 六步对应 beat sheet B4–B9；
// 'follow-up-alternatives' 是 bill/acme follow-up 段的步骤。
// errand cases 在此追加自己的 kind（数据扩展，不碰 store 契约）。
export type ThreadStepKind =
  | 'pm-agent' // B4 PM agent 取证据 + Company RAG + Capabilities
  | 'cross-check' // B5 戳穿 reality gap（MISMATCH 卡）
  | 'hr-root-cause' // B6 HR agent 解释根因（bandwidth 打断非低产）
  | 'human-loop' // B7 拉真人 + agent 背景聆听
  | 'timeline' // B8 agent 调 tool 造 TIMELINE
  | 'structured-output' // B9 6 段式可信输出（AGENT_OUTPUT）
  | 'follow-up-alternatives' // bill/acme follow-up：Jason 替代人选分析
  // web-search errand case（ADR-0013 决策 3）：
  | 'web-search' // agent 调 web tool 查 Apple 政策（浏览器预览卡显形）
  | 'policy-gist' // agent 的实际回答：guideline 要点引文 + 回链 URL（gist 卡）
  | 'follow-up-compliance' // follow-up：Acme companion build 合规判定（短 Manifest）
  // email errand case（ADR-0013 决策 4）：
  | 'memo-draft' // agent 经 doc-reader 读 memo 照片、预填邮件文本（可编辑草稿卡显形）
  | 'email-ready' // email tool 卡待命：To/subject/body 已填、Send 等人点（sendEmail 不进 SCRIPT）
  | 'follow-up-slack' // follow-up：短版发 #eng 的 Slack-message Manifest

// ── 终端流（ADR-0014 决策 2/4）────────────────────────────────────────────────
// 每 step 一组 lines，终端 HUD 逐拍打印。行集合 = (caseDef, thread) 纯函数——
// question 首行 / follow-up 提问行由渲染层从 thread 派生，不在脚本里重复。
// speaker → 前缀 + 专色（决策 4）：errand 的单 agent 用泛 `agent` 色，不冒充 PM/HR。
export type StreamSpeaker = 'you' | 'pm' | 'hr' | 'agent' | 'tool' | 'system' | 'bill'

export type StreamLineType = 'thought' | 'tool-call' | 'tool-result' | 'manifest'

export interface StreamLine {
  speaker: StreamSpeaker
  type: StreamLineType
  text: string
  // manifest 行专用（决策 3）：点击飞向的卡（= cardAnchors 的 step key）。
  ref?: ThreadStepKind
}

export interface CardAnchor {
  pos: Pos
  half: { w: number; h: number }
}

// follow-up 段（ADR-0013 决策 5）：chip 锚在某张 Manifest 卡上；点 chip / composer 提问
// → askFollowUp(text) 把 steps 追加进该 thread 的编排表，无参 runAgent() 继续走。
export interface FollowUpSegment {
  id: string
  anchorStep: ThreadStepKind // chip 锚定的 manifest 卡
  suggestedQuestion: string // chip 文本（自由文本 composer 可覆盖显示文本）
  steps: ThreadStepKind[] // 追加进 thread 编排表的步骤
}

export interface CaseDefinition {
  id: CaseId
  title: string // thread chrome 短名（tab strip / history）
  question: string // 该 case 的默认问题文本（openThread 预填）
  orchestration: ThreadStepKind[] // 主段；follow-up 段经 askFollowUp 追加
  stepLabels: Record<string, string>
  stepContextPct: Record<string, number> // 每步脚本化 context-%（HUD 纯派生）
  stream: Record<string, StreamLine[]> // 每 step 的终端流脚本（ADR-0014）
  manifestLabelPos: Pos
  cardAnchors: Partial<Record<string, CardAnchor>>
  followUps: FollowUpSegment[]
  // question 的附件 chip（email case 的 memo 照片）——终端首行打印（ADR-0014 决策 9）。
  questionAttachment?: { src: string; name: string }
}

// ── 公式工具：双列瀑布（ADR-0014 决策 7）——卡按 step 序贪心放进较短列，不手摆。──

const GRID_LEFT = 200
const GRID_TOP = 320
const GRID_COL_W = 960
const GRID_GAP_X = 80
const GRID_GAP_Y = 90
const GRID_COLUMNS = 2

export function buildManifestGrid(
  stack: Array<[ThreadStepKind, { w: number; h: number }]>,
): Partial<Record<string, CardAnchor>> {
  const anchors: Partial<Record<string, CardAnchor>> = {}
  const colY: number[] = Array.from({ length: GRID_COLUMNS }, () => GRID_TOP)
  for (const [step, half] of stack) {
    let col = 0
    for (let i = 1; i < GRID_COLUMNS; i += 1) {
      if (colY[i] < colY[col]) col = i
    }
    anchors[step] = {
      pos: { x: GRID_LEFT + col * (GRID_COL_W + GRID_GAP_X) + half.w, y: colY[col] + half.h },
      half,
    }
    colY[col] += half.h * 2 + GRID_GAP_Y
  }
  return anchors
}

// Manifest 列标题：横跨双列居中。
const MANIFEST_LABEL_POS: Pos = { x: GRID_LEFT + GRID_COL_W + GRID_GAP_X / 2, y: 210 }

// ════════════════════════════════════════════════════════════════════════════
// bill/acme hero case（重型 hero：6 步 / 4 manifest + follow-up）
// ════════════════════════════════════════════════════════════════════════════

export const BILL_ACME_CASE_ID: CaseId = 'bill-acme'

export const BILL_ACME_CASE: CaseDefinition = {
  id: BILL_ACME_CASE_ID,
  title: 'Bill & the Acme pilot', // ⚠ 待 Danny 审字（tab 短名）
  question: HERO_QUESTION,

  // 主段编排。free-click 每调一次 runAgent 推进一步；
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

  // 每步脚本化 context-%（ADR-0013 决策 7）：重步骤可见地多耗
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

  // 终端流脚本（ADR-0014 决策 2）。事实全部引自 fixtures（SIGNALS / MISMATCH /
  // TIMELINE / AGENT_OUTPUT），不另造数字。copy 经 Danny 审定（2026-06-12）。
  stream: {
    'pm-agent': [
      {
        speaker: 'pm',
        type: 'thought',
        text: 'Scoping the question — the Friday ship runs through the Connector dependency. Pulling its live signals first.',
      },
      { speaker: 'pm', type: 'tool-call', text: 'pull signals --project connector --window 7d' },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'PR #142 (Slack ingest): open 6 days, no new commits',
      },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: '#eng: "Blocked on Slack API rate limits" — raised 3 days running, unresolved',
      },
      { speaker: 'tool', type: 'tool-result', text: 'Connector tasks: 0 updates in 4 days' },
      {
        speaker: 'pm',
        type: 'thought',
        text: 'Stalled signals on a downstream dependency, days from a ship date — checking the playbook before jumping to staffing moves.',
      },
      {
        speaker: 'system',
        type: 'thought',
        text: 'Capability loaded · Cross-team dependency at risk near a deadline',
      },
    ],
    'cross-check': [
      {
        speaker: 'pm',
        type: 'thought',
        text: 'Now cross-checking the signals against what the team believes.',
      },
      { speaker: 'pm', type: 'tool-call', text: 'read status --source standup --project connector' },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'Bill marked Connector "on track" in Monday standup',
      },
      {
        speaker: 'pm',
        type: 'thought',
        text: 'Reported on-track, signals say at-risk — that is a report mismatch. Surfacing it as evidence, not judgment.',
      },
      { speaker: 'system', type: 'manifest', text: 'Reality gap — report mismatch', ref: 'cross-check' },
    ],
    'hr-root-cause': [
      {
        speaker: 'hr',
        type: 'thought',
        text: "Picking this up from the HR side — a stall this sharp is rarely about effort. Checking interrupt load before anyone reads it as performance.",
      },
      { speaker: 'hr', type: 'tool-call', text: 'pull signals --person bill --tag interrupt' },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'Bill @-mentioned 9× in 3 days in #acme-support to fight urgent customer issues',
      },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: "This week's commits are mostly Acme hotfixes, not Connector work",
      },
      {
        speaker: 'hr',
        type: 'thought',
        text: 'Interrupt overload, not underperformance. The fix is workload routing — never a personnel call from a single stalled signal.',
      },
      {
        speaker: 'system',
        type: 'thought',
        text: 'Capability loaded · Low output vs. interrupt overload',
      },
    ],
    'human-loop': [
      {
        speaker: 'system',
        type: 'thought',
        text: 'The agents need a human call — opening a thread chat with Bill. Agents stay in the room.',
      },
      {
        speaker: 'pm',
        type: 'thought',
        text: 'Bill — PR #142 has had no commits for 6 days. Is the stall the rate-limit work, or something else?',
      },
      {
        speaker: 'bill',
        type: 'thought',
        text: "It's the rate-limit handling — but honestly I've barely touched it. I've been pulled into Acme-support fires all week.",
      },
      {
        speaker: 'bill',
        type: 'thought',
        text: 'Route the support pulls elsewhere for two days and I can land it by Thursday.',
      },
      {
        speaker: 'hr',
        type: 'thought',
        text: 'That matches the signals — interrupt load, not output. No performance read here.',
      },
      { speaker: 'system', type: 'manifest', text: 'Human loop — Bill enters the loop', ref: 'human-loop' },
    ],
    timeline: [
      {
        speaker: 'pm',
        type: 'thought',
        text: "Bill's Thursday commitment unblocks the path. Re-baselining the plan around the Friday ship.",
      },
      {
        speaker: 'pm',
        type: 'tool-call',
        text: 'timeline rebuild --protect "Ship core (Fri)" --defer non-core',
      },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'Connector core → Thu · Acme hookup → Thu pm · UAT → Fri am · Ship core → Fri (held)',
      },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'Event dedupe → next week (deferred) · Slip to Tue → conditional only',
      },
      { speaker: 'system', type: 'manifest', text: 'Re-baselined timeline — Friday holds', ref: 'timeline' },
    ],
    'structured-output': [
      {
        speaker: 'pm',
        type: 'thought',
        text: 'Assembling the decision report — conclusion, evidence, uncertainties, actions, confirmations.',
      },
      {
        speaker: 'hr',
        type: 'thought',
        text: 'Adding the safe framing: this is a workload-routing issue, not a personnel judgment.',
      },
      {
        speaker: 'pm',
        type: 'thought',
        text: 'Two human confirmations required: the contingency slip call (you) and the Acme scope cut (Vanessa).',
      },
      { speaker: 'system', type: 'manifest', text: 'Decision report — ready for human review', ref: 'structured-output' },
    ],
    'follow-up-alternatives': [
      {
        speaker: 'pm',
        type: 'thought',
        text: "Re-opening the staffing question — if Jason takes the new job, who absorbs Bill's interrupts?",
      },
      { speaker: 'pm', type: 'tool-call', text: 'scan capacity --team eng --window 7d' },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'Fred 78% · Nasim 85% · Aidy 82% — signal pictures attached',
      },
      {
        speaker: 'pm',
        type: 'thought',
        text: 'Fred is the strongest alternative — closest overlap with the ingestion path, clean week. Keep any swap to ≤ 2 days.',
      },
      { speaker: 'system', type: 'manifest', text: 'Alternatives for Jason', ref: 'follow-up-alternatives' },
    ],
  },

  manifestLabelPos: MANIFEST_LABEL_POS,

  // 双列瀑布（ADR-0014 决策 7）：卡按 step 序贪心入较短列。half = 估算半宽/半高，
  // 仅供镜头 bbox 与瀑布间距。
  cardAnchors: buildManifestGrid([
    ['cross-check', { w: 380, h: 330 }],
    ['human-loop', { w: 360, h: 380 }],
    ['timeline', { w: 425, h: 350 }],
    ['structured-output', { w: 475, h: 460 }],
    ['follow-up-alternatives', { w: 400, h: 300 }],
  ]),

  // bill/acme follow-up showcase（ADR-0013 决策 5）。
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
// web-search errand case（ADR-0013 决策 3）：Apple expedited-review 政策查询。
// 短链证"日常主力"——2 步主段 + 1 步 follow-up 合规判定；context-% 收在 ~15%，
// 与 hero 的 ~71% 形成可见对比。浏览器预览卡 = fixture 截图 + 真实 URL 栏，
// 否决 live iframe（Apple 发 X-Frame-Options/CSP + 会场断网风险）；零运行时网络依赖。
// ════════════════════════════════════════════════════════════════════════════

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

  // 短链主段：2 步（errand 深度，ADR-0013 决策 2——否决等重编排）。
  orchestration: ['web-search', 'policy-gist'],

  stepLabels: {
    'web-search': 'Agent searches Apple developer docs', // ⚠ 待 Danny 审字
    'policy-gist': 'Policy gist is ready', // ⚠ 待 Danny 审字
    'follow-up-compliance': 'Agent checks the Acme build against the guidelines', // ⚠ 待 Danny 审字
  },

  // errand thread 的低 context-%（决策 7）：主段收在 ~15%，follow-up 推到 ~23%——
  // 与 hero 的 71%/80% 成对比，"thread 是真实会话边界"可被看见。
  stepContextPct: {
    'web-search': 8,
    'policy-gist': 15,
    'follow-up-compliance': 23,
  },

  // stream copy 经 Danny 审定（2026-06-12）。
  stream: {
    'web-search': [
      {
        speaker: 'agent',
        type: 'thought',
        text: "Expedited App Review — the answer should come from Apple's own documentation, not memory.",
      },
      {
        speaker: 'agent',
        type: 'tool-call',
        text: 'web search "expedited app review site:developer.apple.com"',
      },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'developer.apple.com/app-store/review/guidelines/ — App Review Guidelines',
      },
      { speaker: 'agent', type: 'tool-call', text: `open ${APPLE_POLICY_URL_DISPLAY}` },
      { speaker: 'system', type: 'manifest', text: 'Page preview — developer.apple.com', ref: 'web-search' },
    ],
    'policy-gist': [
      {
        speaker: 'agent',
        type: 'thought',
        text: 'Distilling the policy to what matters for the Acme companion launch.',
      },
      {
        speaker: 'agent',
        type: 'thought',
        text: 'Expedited review exists, but only for extenuating circumstances — and 90% of normal submissions clear in under 24 hours.',
      },
      {
        speaker: 'agent',
        type: 'thought',
        text: 'Citing each point back to its source URL so the answer is checkable.',
      },
      { speaker: 'system', type: 'manifest', text: 'Policy gist — sources cited', ref: 'policy-gist' },
    ],
    'follow-up-compliance': [
      {
        speaker: 'agent',
        type: 'thought',
        text: 'Checking the current Acme companion build against the guidelines just cited.',
      },
      { speaker: 'agent', type: 'tool-call', text: 'review build --against guidelines 2.1, 5.1.1' },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'Release candidate final ✓ · privacy labels stale (new analytics SDK undeclared) ⚠',
      },
      {
        speaker: 'agent',
        type: 'thought',
        text: 'One fix before submitting: declare the analytics SDK in the privacy labels. Everything else is ready.',
      },
      { speaker: 'system', type: 'manifest', text: 'Compliance check — Acme companion build', ref: 'follow-up-compliance' },
    ],
  },

  manifestLabelPos: MANIFEST_LABEL_POS,

  cardAnchors: buildManifestGrid([
    ['web-search', { w: 330, h: 420 }], // 浏览器预览卡（卡内可滚动看长图）
    ['policy-gist', { w: 330, h: 300 }],
    ['follow-up-compliance', { w: 330, h: 230 }],
  ]),

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

// ════════════════════════════════════════════════════════════════════════════
// email errand case（ADR-0013 决策 4）：memo 照片 → 可编辑草稿 → email 工具 →
// 人点 Send。"人扣扳机"的经人确认 beat——`sendEmail()` 是 store action（dedupe-guarded）
// 但**不进 rail SCRIPT**（同 dispatchTask 先例，ADR-0006 决策 5）。
// ════════════════════════════════════════════════════════════════════════════

export const EMAIL_CASE_ID: CaseId = 'email-eng-memo'

// ★ memo 照片占位资产（P6-08 HITL：Danny 换真实 memo 照片）——路径集中在这一个常量：
// 换照片 = 直接覆盖 public/memo-draft-photo.svg，或把真照片放进 public/ 后改这一行。
export const MEMO_PHOTO_SRC = '/memo-draft-photo.svg'
export const MEMO_PHOTO_NAME = 'memo-draft.jpg' // attachment chip 显示的文件名 ⚠ 待 Danny 审字

export const EMAIL_CASE: CaseDefinition = {
  id: EMAIL_CASE_ID,
  title: 'Memo → Eng email', // ⚠ 待 Danny 审字（tab 短名）
  // ADR-0013 决策 4 / issue 原文——resolveCaseForQuestion 精确匹配此文本进本 case 的 thread。
  question: 'Turn this memo draft into an email and send it to everyone in Engineering.', // ⚠ 待 Danny 审字

  // 短链主段：2 步（errand 深度，决策 2）。Send 本身不是编排步骤——email-ready 把一切
  // 备好，扣扳机的是人（sendEmail action，不进 SCRIPT）。
  orchestration: ['memo-draft', 'email-ready'],

  stepLabels: {
    'memo-draft': 'Agent reads the memo and drafts the email', // ⚠ 待 Danny 审字
    'email-ready': 'Email staged — waiting for you to hit Send', // ⚠ 待 Danny 审字
    'follow-up-slack': 'Agent drafts the short version for #eng', // ⚠ 待 Danny 审字
  },

  // errand thread 的低 context-%（决策 7）：主段收在 ~17%，follow-up 推到 ~24%。
  stepContextPct: {
    'memo-draft': 9,
    'email-ready': 17,
    'follow-up-slack': 24,
  },

  // stream copy 经 Danny 审定（2026-06-12）。
  stream: {
    'memo-draft': [
      {
        speaker: 'agent',
        type: 'thought',
        text: 'One attachment on the question — a photographed memo draft. Reading it first.',
      },
      { speaker: 'agent', type: 'tool-call', text: `doc read ${MEMO_PHOTO_NAME}` },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'Extracted: code freeze Thursday 6pm · Acme support pings → on-call rotation',
      },
      {
        speaker: 'agent',
        type: 'thought',
        text: 'Drafting the announcement email for Engineering — the draft stays editable until you send it.',
      },
      { speaker: 'system', type: 'manifest', text: 'Email draft — editable', ref: 'memo-draft' },
    ],
    'email-ready': [
      {
        speaker: 'agent',
        type: 'tool-call',
        text: 'email stage --to eng-all --subject "Friday ship: code freeze + Acme support rotation"',
      },
      { speaker: 'tool', type: 'tool-result', text: '6 recipients resolved from the team roster' },
      {
        speaker: 'system',
        type: 'thought',
        text: 'Everything is staged. Sending waits for a human — the trigger is yours.',
      },
      { speaker: 'system', type: 'manifest', text: 'Email staged — waiting for Send', ref: 'email-ready' },
    ],
    'follow-up-slack': [
      {
        speaker: 'agent',
        type: 'thought',
        text: 'Condensing the email into a two-line heads-up for #eng.',
      },
      { speaker: 'agent', type: 'tool-call', text: 'slack draft --channel #eng' },
      {
        speaker: 'tool',
        type: 'tool-result',
        text: 'Draft ready — full details deferred to the email just staged',
      },
      { speaker: 'system', type: 'manifest', text: 'Slack message — short version for #eng', ref: 'follow-up-slack' },
    ],
  },

  manifestLabelPos: MANIFEST_LABEL_POS,

  cardAnchors: buildManifestGrid([
    ['memo-draft', { w: 330, h: 280 }], // 可编辑草稿卡（textarea）
    ['email-ready', { w: 330, h: 330 }], // email-tool 卡（To/subject/body + Send）
    ['follow-up-slack', { w: 330, h: 190 }], // Slack-message 小卡
  ]),

  // follow-up showcase（决策 5）：chip 锚在 email-tool 卡。
  followUps: [
    {
      id: 'slack-short-version',
      anchorStep: 'email-ready',
      suggestedQuestion: 'Also post a short version to #eng in Slack', // ⚠ 待 Danny 审字
      steps: ['follow-up-slack'],
    },
  ],

  // question 的 memo 照片附件 chip（占位资产，见 MEMO_PHOTO_SRC 注释）——终端首行打印。
  questionAttachment: { src: MEMO_PHOTO_SRC, name: MEMO_PHOTO_NAME },
}

// ── case 注册表：后续 case 在此追加定义（数据扩展，不碰 store 契约）。──

export const DEFAULT_CASE_ID: CaseId = BILL_ACME_CASE_ID

export const CASES: Record<CaseId, CaseDefinition> = {
  [BILL_ACME_CASE_ID]: BILL_ACME_CASE,
  [WEB_SEARCH_CASE_ID]: WEB_SEARCH_CASE,
  [EMAIL_CASE_ID]: EMAIL_CASE,
}

// askQuestion 的 case 解析（ADR-0013：askQuestion 变 case-aware）：问题文本精确命中某 case
// 的默认问题 → 进该 case 的 thread；其余任意文本（自由 composer / handoff flyToNexus）
// 落 hero case——与今日单 thread 行为同构，ADR-0001 prototype 范围内诚实。
export function resolveCaseForQuestion(text: string): CaseId {
  const hit = Object.values(CASES).find((c) => c.question === text)
  return hit ? hit.id : DEFAULT_CASE_ID
}

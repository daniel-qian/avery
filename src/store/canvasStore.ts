import { create } from 'zustand'
import { BRIEFING_V1, BRIEFING_V2, type Briefing, type TaskTemplate } from '../data/fixtures'

// 单一事实源（ADR-0003）：一套 state + 一套 action，free-click 与 rail 都只走这套 action。
// rail = 之上的薄 driver（删 rail = 删 SCRIPT + DemoControls，不删任何行为）。
//
// 本文件 = P0.5 contract pass 的产物：state 形状与 action 签名一次性冻结，
// 三个 build phase（P1 Dashboard / P2 Nexus / P3 详情）都对着这份契约写、互不改 store。
// action 现按 ADR-0003 返回 fixture / 推进 stub，以后换真逻辑而签名不变。

export type Scene =
  | 'onboarding'
  | 'dashboard'
  | 'nexus'
  | 'project'
  | 'employee'
  | 'capabilities'

// focus = calm 的反面：点亮一组关联实体（其余淡化），可由三种选择器产生。
// 单点节点也点亮"该实体 + 关联集合"，不是只亮被点那一个（beat B2「相关亮/无关淡」）。
// 集合的解析逻辑在 src/lib/focus.ts（纯函数吃 fixtures）；store 只存已解析结果，保持 dumb。
export type FocusSource = 'node' | 'tag' | 'search'

export interface Focus {
  source: FocusSource
  projectIds: string[] // 点亮的项目 → .is-related
  personIds: string[] // 点亮的人 → .is-related
  primary?: { kind: 'person' | 'project'; id: string } // 锚点（node 来源=被点那个）→ .is-focused
  selector?: { tags?: string[]; query?: string } // 顶部 UI 回显当前 tag / 搜索词
}

export type Detail = { kind: 'project' | 'employee'; id: string } | null

// ── Nexus 编排 thread（P2）。每个 step 的内容从 fixtures 按 kind 渲染（dumb 组件）。──
// step kind 对应 beat sheet B4–B9；P2 定内容/节奏，P4 rail 定自动推进，本文件只定形状。
export type ThreadStepKind =
  | 'pm-agent' // B4 PM agent 取证据 + Company RAG + Capabilities
  | 'cross-check' // B5 戳穿 reality gap（MISMATCH 卡）
  | 'hr-root-cause' // B6 HR agent 解释根因（bandwidth 打断非低产）
  | 'human-loop' // B7〔nice-to-have〕拉真人 + agent 背景聆听
  | 'timeline' // B8 agent 调 tool 造 TIMELINE
  | 'structured-output' // B9 6 段式可信输出（AGENT_OUTPUT）

export interface ThreadStep {
  kind: ThreadStepKind
}

export type ThreadStatus = 'idle' | 'running' | 'complete'

export interface DispatchedTask extends TaskTemplate {
  id: string
}

// 默认编排顺序（stub）。free-click 每调一次 runAgent 推进一步；
// P2 可改内容、P4 rail 可改节奏——这是 scripted data，不是分支逻辑（零 if(demoMode)）。
const ORCHESTRATION: ThreadStepKind[] = [
  'pm-agent',
  'cross-check',
  'hr-root-cause',
  'human-loop',
  'timeline',
  'structured-output',
]

interface CanvasState {
  scene: Scene
  focus: Focus | null // null = calm（点空白 → setFocus(null)）
  detail: Detail
  briefing: Briefing // 当前 Dashboard 上的 Briefing（B1 = V1，B10 regen → V2）
  thread: {
    question: string | null // 启动该 thread 的 hero 问题（B3）
    steps: ThreadStep[] // 随 runAgent 累积
    status: ThreadStatus
  }
  tasks: DispatchedTask[] // B9 经人确认派出的 task

  // ── 导航（P1 / P3 共用）──
  goScene: (scene: Scene) => void
  setFocus: (focus: Focus | null) => void // 三种选择器统一出口；null = 恢复 calm
  openDetail: (kind: 'project' | 'employee', id: string) => void // drill-in
  back: () => void

  // ── 编排 / 内容（P2 行为全走这套；现为 fixture / 推进 stub）──
  askQuestion: (text: string) => void // B3 composer → 问题飞进 Nexus
  runAgent: () => void // B4–B9 推进 thread 一步
  dispatchTask: (template: TaskTemplate) => void // B9 派 task
  regenBriefing: () => void // B10 重生成 Briefing（v1 → v2）
}

export const useCanvas = create<CanvasState>((set, get) => ({
  scene: 'dashboard',
  focus: null,
  detail: null,
  briefing: BRIEFING_V1,
  thread: { question: null, steps: [], status: 'idle' },
  tasks: [],

  goScene: (scene) => set({ scene }),
  setFocus: (focus) => set({ focus }),
  openDetail: (kind, id) => set({ scene: kind, detail: { kind, id } }),
  back: () => set({ scene: 'dashboard', detail: null, focus: null }),

  askQuestion: (text) =>
    set({ scene: 'nexus', thread: { question: text, steps: [], status: 'running' } }),

  runAgent: () => {
    const { thread } = get()
    const next = ORCHESTRATION[thread.steps.length]
    if (!next) {
      set({ thread: { ...thread, status: 'complete' } })
      return
    }
    const steps = [...thread.steps, { kind: next }]
    set({
      thread: {
        ...thread,
        steps,
        status: steps.length === ORCHESTRATION.length ? 'complete' : 'running',
      },
    })
  },

  dispatchTask: (template) =>
    set((s) => {
      const alreadyDispatched = s.tasks.some(
        (task) =>
          task.title === template.title &&
          task.assigneeId === template.assigneeId &&
          task.due === template.due,
      )

      if (alreadyDispatched) return s

      return { tasks: [...s.tasks, { ...template, id: `dt_${s.tasks.length + 1}` }] }
    }),

  regenBriefing: () => set({ briefing: BRIEFING_V2 }),
}))

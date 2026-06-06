import { create } from 'zustand'
import { HERO_QUESTION } from '../data/fixtures'
import { focusEntity } from '../lib/focus'
import { useCanvas } from './canvasStore'

type RailStep = {
  beat: string
  label: string
  run: () => void
}

const INITIAL = useCanvas.getState()

export const SCRIPT: RailStep[] = [
  {
    beat: 'B0',
    label: 'Onboarding prologue',
    run: () => useCanvas.getState().goScene('onboarding'),
  },
  {
    beat: 'B1',
    label: 'Dashboard calm',
    run: () => useCanvas.getState().goScene('dashboard'),
  },
  {
    beat: 'B2',
    label: 'Focus Acme risk cluster',
    run: () => useCanvas.getState().setFocus(focusEntity('project', 'p_acme')),
  },
  // P5-04 Act1（ADR-0009）：Nexus 前 drill「看现状」。thread.steps 空 → 详情页派生 believed 态（零剧透）。
  // 顺序参 demo-brief：focus → drill Acme → drill Bill → ask；不用 back()，下一步 askQuestion 自带 goScene('nexus') 飞进 Nexus。
  // ⚠ 待 Danny 审字：两条 drill 的 caption label。
  {
    beat: 'B2',
    label: 'Drill Acme — current state',
    run: () => useCanvas.getState().openDetail('project', 'p_acme'),
  },
  {
    beat: 'B2',
    label: 'Drill Bill — current state',
    run: () => useCanvas.getState().openDetail('employee', 'u_bill'),
  },
  {
    beat: 'B3',
    label: 'Ask Nexus',
    run: () => useCanvas.getState().askQuestion(HERO_QUESTION),
  },
  {
    beat: 'B4',
    label: 'PM agent checks evidence',
    run: () => useCanvas.getState().runAgent(),
  },
  {
    beat: 'B5',
    label: 'Reality gap cross-check',
    run: () => useCanvas.getState().runAgent(),
  },
  {
    // P5-04 (ADR-0007)：思考流 B4–B9 零整页 drill-in。B6 塌成单步；Bill 的 drill 已搬到 Act1（B2 前戏段）。
    beat: 'B6',
    label: 'HR root-cause check',
    run: () => useCanvas.getState().runAgent(),
  },
  {
    beat: 'B7',
    label: 'Human loop',
    run: () => useCanvas.getState().runAgent(),
  },
  {
    beat: 'B8',
    label: 'Timeline tool output',
    run: () => useCanvas.getState().runAgent(),
  },
  {
    beat: 'B9',
    label: 'Structured output',
    run: () => useCanvas.getState().runAgent(),
  },
  {
    beat: 'B9b',
    label: 'Drill Acme — re-baselined',
    run: () => useCanvas.getState().openDetail('project', 'p_acme'),
  },
  {
    beat: 'B9b',
    label: 'Drill Bill — protected focus',
    run: () => useCanvas.getState().openDetail('employee', 'u_bill'),
  },
  {
    beat: 'B10',
    label: 'Briefing regenerated',
    run: () => {
      const canvas = useCanvas.getState()
      canvas.regenBriefing()
      canvas.goScene('dashboard')
    },
  },
  {
    // P5-01 (ADR-0007)：Capabilities 移出思考流，作独立收尾 beat（13/13）= 护城河 + 营收收束。
    beat: 'B11',
    label: 'Capabilities — the moat',
    run: () => useCanvas.getState().goScene('capabilities'),
  },
]

export const LAST_RAIL_INDEX = SCRIPT.length - 1

interface RailState {
  index: number
  hidden: boolean
  seek: (target: number) => void
  next: () => void
  prev: () => void
  restart: () => void
  toggleHidden: () => void
}

function clampIndex(target: number) {
  return Math.max(0, Math.min(target, LAST_RAIL_INDEX))
}

export const useRail = create<RailState>((set, get) => ({
  index: 0,
  hidden: false,

  seek: (target) => {
    const index = clampIndex(target)
    useCanvas.setState(INITIAL, true)
    for (let i = 0; i <= index; i += 1) {
      SCRIPT[i].run()
    }
    set({ index, hidden: false })
  },

  next: () => get().seek(get().index + 1),
  prev: () => get().seek(get().index - 1),
  restart: () => get().seek(0),
  toggleHidden: () => set((state) => ({ hidden: !state.hidden })),
}))

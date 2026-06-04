import { create } from 'zustand'

// 单一事实源（ADR-0003）：scene/focus/detail 一套 state，
// free-click 与 rail 都只走下面这套 action —— rail 是之上的薄 driver。

export type Scene =
  | 'onboarding'
  | 'dashboard'
  | 'nexus'
  | 'project'
  | 'employee'
  | 'capabilities'

export type Focus =
  | { kind: 'person'; id: string }
  | { kind: 'project'; id: string }
  | null

export type Detail = { kind: 'project' | 'employee'; id: string } | null

interface CanvasState {
  scene: Scene
  focus: Focus
  detail: Detail
  // ── actions（rail 与 free-click 共用）──
  goScene: (scene: Scene) => void
  setFocus: (focus: Focus) => void
  openDetail: (kind: 'project' | 'employee', id: string) => void
  back: () => void
}

export const useCanvas = create<CanvasState>((set) => ({
  scene: 'dashboard',
  focus: null,
  detail: null,
  goScene: (scene) => set({ scene }),
  setFocus: (focus) => set({ focus }),
  openDetail: (kind, id) => set({ scene: kind, detail: { kind, id } }),
  back: () => set({ scene: 'dashboard', detail: null, focus: null }),
}))

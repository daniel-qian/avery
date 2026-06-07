import { describe, it, expect } from 'vitest'
import {
  selectCameraPoints,
  CALM_HOME_SCALE,
  CALM_HOME_TARGET,
  PERSON_POS,
  PROJECT_POS,
  CENTER,
} from './layout'
import type { Focus } from '../store/canvasStore'

// P6 issue (dashboard-radial-recompose):
//   B6 (REWRITTEN after visual review) — calm 走硬编码 home transform,不 bbox fit。
//         14 人内环 board 高度 ≈ 1008px, 桌面视口 1280×720 可用高 480px,
//         bbox fit scale ≈ 0.37 (issue §0 描述的"全图鸟瞰节点变小"的根因)。
//         修法: calm = 硬编码 (position 把 board 中心对到屏幕可用区中心,
//                            scale 固定 0.85, 14 人不全显示可 pan)。
//         合同: selectCameraPoints(focus=null) 返回 [CENTER] 单点作为 anchor,
//               useRailCamera 在 calm 路径特判用 home transform。
//         focus 仍走 bbox fit(primary + 关联人/项目)。
//
//   之前的 TDD 测了"calm 包含 14 人 + bbox 比 wholeMap 小" — 那是无效合同,
//   它把"calm 必须 fit 所有人"写进了合同 → 几何上锁死了 0.37 缩放。
//   本次重写把合同改成真值。

const focusOnVanessa: Focus = {
  source: 'node',
  primary: { kind: 'person', id: 'u_vanessa' },
  personIds: ['u_vanessa'],
  projectIds: ['p_acme'],
}

describe('layout — selectCameraPoints (B6, rewritten)', () => {
  it('calm returns the home anchor (CENTER) as a single point, NOT the whole map', () => {
    // P6 修法: calm 不再 fit 14 人 — 只返回 [CENTER] 一个 anchor,
    // useRailCamera 在 calm 路径用 home transform (scale=0.85, position 把
    // CENTER 对到屏幕可用区中心)。
    const pts = selectCameraPoints(null)
    expect(pts).toEqual([CENTER])
  })

  it('calm anchor is the board geometric center (CENTER === CALM_HOME_TARGET)', () => {
    const pts = selectCameraPoints(null)
    expect(pts[0]).toEqual(CALM_HOME_TARGET)
  })

  it('calm scale constant is 0.85 (issue §3 起点 + issue §2-B 0.9 舍入)', () => {
    // 硬值 — 真值靠浏览器调,起点 0.85; 用户可改 CALM_HOME_SCALE 一处。
    expect(CALM_HOME_SCALE).toBe(0.85)
  })

  it('focus returns the focus cluster (primary + related), not the home anchor', () => {
    const pts = selectCameraPoints(focusOnVanessa)
    expect(pts.length).toBe(2)

    const vanessaPos = PERSON_POS['u_vanessa']
    const acmePos = PROJECT_POS['p_acme']
    expect(vanessaPos).toBeDefined()
    expect(acmePos).toBeDefined()

    const hasVanessa = pts.some((p) => p.x === vanessaPos.x && p.y === vanessaPos.y)
    const hasAcme = pts.some((p) => p.x === acmePos.x && p.y === acmePos.y)
    expect(hasVanessa).toBe(true)
    expect(hasAcme).toBe(true)

    // focus cluster 一定包含 owner(人) + project; center 单点不出现
    const hasCenter = pts.some((p) => p.x === CENTER.x && p.y === CENTER.y)
    expect(hasCenter).toBe(false)
  })

  it('focus with empty cluster falls back to the home anchor (defensive)', () => {
    // 防御: focus 解析没拿到任何点 → 退回 home anchor (calm 等价)。
    const emptyFocus: Focus = { source: 'tag', personIds: [], projectIds: [] }
    const pts = selectCameraPoints(emptyFocus)
    expect(pts).toEqual([CENTER])
  })

  it('project ring (7 projects) is independent of camera decisions', () => {
    // 锁住 §4 项 4: 外环项目不参与 calm 框景。
    // 7 个项目都在 PROJECT_POS,但 selectCameraPoints(null) 不会返回它们。
    expect(Object.keys(PROJECT_POS).length).toBe(7)
    const calmPts = selectCameraPoints(null)
    for (const proj of Object.values(PROJECT_POS)) {
      const inCalm = calmPts.some((p) => p.x === proj.x && p.y === proj.y)
      expect(inCalm, 'calm must not include any project position').toBe(false)
    }
  })
})

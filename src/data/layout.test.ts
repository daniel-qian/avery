import { describe, it, expect } from 'vitest'
import { DASH_BOARD, PERSON_POS, PROJECT_POS, CENTER } from './layout'
import { PEOPLE } from './fixtures'

// P6 issue (dashboard-radial-recompose):
//   B1 — Dashboard 静息态不再"fit 全图" → 起点参数 §3：board 从 2600 缩到 1700–1900。
//   锁住"我们故意把 board 做小"的事实 —— 这是 calm 框景"可读"的几何前提。
//
//   B2 — A1 决策：briefing 即 nucleus，放射中心是 briefing（不是 You）。
//        You(u_you) 降为内环普通一员，**不在 board 正中心**。
//        board 几何中心留空给 briefing → "中心不打架"。

describe('layout — DASH_BOARD size (B1)', () => {
  it('exports a finite square board', () => {
    expect(Number.isFinite(DASH_BOARD.width)).toBe(true)
    expect(Number.isFinite(DASH_BOARD.height)).toBe(true)
    expect(DASH_BOARD.width).toBe(DASH_BOARD.height) // 保持正方形
  })

  it('is sized in the 1700–1900 range (no longer the 2600 fit-everything board)', () => {
    // 起点参数 §3: "board: 从 2600 缩到 ~1700–1900"
    // 这是回归守门 —— 谁把 board 改回 2600 (或 3000) 都会被 B1 拒。
    expect(DASH_BOARD.width).toBeGreaterThanOrEqual(1700)
    expect(DASH_BOARD.width).toBeLessThanOrEqual(1900)
  })
})

describe('layout — You is not the nucleus (B2)', () => {
  it('You (u_you) does NOT sit at the board geometric center', () => {
    // A1 决策：center 留给 briefing，You 进内环当普通一员。
    // 旧 P5: PERSON_POS.u_you === CENTER → 跟 briefing 重叠。
    const you = PERSON_POS['u_you']
    expect(you, 'PERSON_POS.u_you should exist').toBeDefined()
    expect(you.x, 'You.x should not equal CENTER.x (hub special case removed)').not.toBe(CENTER.x)
    expect(you.y, 'You.y should not equal CENTER.y (hub special case removed)').not.toBe(CENTER.y)
  })

  it('the board center has no node on it (center is reserved for briefing)', () => {
    // 反向验证：board 中心附近不该有人/项目。
    for (const [id, pos] of Object.entries(PERSON_POS)) {
      const dx = Math.abs(pos.x - CENTER.x)
      const dy = Math.abs(pos.y - CENTER.y)
      expect(dx === 0 && dy === 0, `${id} is sitting on the board center`).toBe(false)
    }
  })

  it('You has a distinct inner-ring angle (not a hub special case)', () => {
    // You 必须像其他内环人一样有一个明确的环角，
    // —— 这样 pitch 就能对齐 You 的环角（外环放辐条），
    // —— 也证明 layout 已不再"给 hub 保留中心"而把它当普通一员。
    const you = PERSON_POS['u_you']
    expect(you, 'PERSON_POS.u_you should exist').toBeDefined()
    // 假设新的 R_INNER 在 [400, 800] 区间（先验保守值，B4 收紧）
    const R = Math.hypot(you.x - CENTER.x, you.y - CENTER.y)
    expect(R, 'You should be on the inner ring (R between 400 and 800)').toBeGreaterThan(400)
    expect(R).toBeLessThan(800)
  })
})

describe('layout — PITCH follows You, no -90 special case (B3)', () => {
  it('pitch (p_pitch, owner=u_you) is placed at You\'s inner-ring angle, not a reserved -90°', () => {
    // A1 子项：You 进内环后，pitch(owner=u_you) 对齐 You 的环角；
    // —— 旧 P5 的 PITCH_ANGLE_DEG = -90 特例是为"给无角的 hub 保留顶部头条位"，
    //    A1 推翻 hub 后特例消失。
    const you = PERSON_POS['u_you']
    const pitch = PROJECT_POS['p_pitch']
    expect(you).toBeDefined()
    expect(pitch).toBeDefined()

    // pitch 必须和 You 在同一条径向（角度一致）→ owner→project 短辐条。
    // 容差 1e-2 rad (~0.57°)：坐标 round 到整数后,560/920 半径上 0.5px 误差累积 ~6e-4 rad。
    const youAngle = Math.atan2(you.y - CENTER.y, you.x - CENTER.x)
    const pitchAngle = Math.atan2(pitch.y - CENTER.y, pitch.x - CENTER.x)
    expect(Math.abs(pitchAngle - youAngle), 'pitch should share You\'s ring angle (radial)').toBeLessThan(1e-2)
  })

  it('no project sits at a reserved top angle that bypasses the ring formula', () => {
    // 反向验证：所有项目都遵循"owner 的内环角 + R_OUTER"公式。
    // pitch 不再被特殊放到 -90°（正上方）—— 它和它的 owner(u_you) 在同角度。
    const pitch = PROJECT_POS['p_pitch']
    // pitch 不应该在正上 (0, -R) → 那意味着 angle = -90°
    const atTop = Math.abs(pitch.x - CENTER.x) === 0 && pitch.y < CENTER.y
    // 弱断言：pitch.x 跟 CENTER.x 相差较大 (不在正上)。
    // 给一个保守阈值 — 因为 R_OUTER=920,board 中心 (900,900),
    // pitch 在 -84° 时 x = 900 + 920*cos(-84°) = 900 + 96 = 996, 距 center.x 96px。
    expect(Math.abs(pitch.x - CENTER.x), 'pitch.x should NOT be exactly CENTER.x (no -90° special)').toBeGreaterThan(20)
  })
})

describe('layout — inner ring clears the briefing (B4)', () => {
  // A1 子项：内环半径必须让人环清开 briefing 盒。
  // briefing 视口半宽 230px + 余白 50px = 280px (issue §2-A1)
  // —— calm scale ≈ 0.9 下，内环人卡到 board 中心的屏幕距离必须 > 280px。
  // 我们用 board 像素距离来锁——calm 缩放后这个距离会被 scale 缩，但起点要保证不被卡死：
  //   board 距离 R_INNER=560,scale=0.9 → 屏幕 ~504px, >> 280 ✓
  //
  // 测试策略：min(人→中心 距离) - 人卡半宽 > briefing 半宽 + 余白
  // 人卡宽 ~360 (PixelAvatar 34px + body 文字 padding),半宽 ~180
  // briefing 宽 460,半宽 230 + 余白 50 = 280
  // → R_INNER 至少要: 280 + 180 = 460
  // 我们用 460 作为下限（让核 算的几何本身留有视觉余量），但允许更大。
  const PERSON_CARD_HALF_WIDTH = 180 // 人卡宽 ~360
  const BRIEFING_HALF_WIDTH = 230    // 460 / 2
  const VISUAL_PADDING = 50          // 内环离 briefing 盒的余白

  it('R_INNER is large enough that no person card overlaps the briefing box', () => {
    // 公式：min(人卡到 board 中心距离) >= briefing 半宽 + 余白 + 人卡半宽
    //     = 230 + 50 + 180 = 460
    // 在 R_INNER=560 时：屏幕距离 = 560 * 0.9 = 504, > 460 ✓ (calm scale 0.9)
    // —— 我们锁 BOARD 距离 (R_INNER) ≥ 460，留出 calm scale 缩放余地。
    const minRequired = BRIEFING_HALF_WIDTH + VISUAL_PADDING + PERSON_CARD_HALF_WIDTH
    for (const id of Object.keys(PERSON_POS)) {
      const pos = PERSON_POS[id]
      const d = Math.hypot(pos.x - CENTER.x, pos.y - CENTER.y)
      expect(d, `${id} is too close to the briefing box (d=${d} < ${minRequired})`).toBeGreaterThanOrEqual(minRequired)
    }
  })

  it('the closest person to center is not closer than the briefing safe zone', () => {
    // 反向表达：所有人到中心距离的最小值 ≥ briefing 安全区(屏幕) / calm 缩放 (board)
    // board 距离 = 屏幕距离 / scale → 保守 0.9 scale → board 距离 = 屏幕 / 0.9
    // 屏幕安全区 = 280 → board 距离 ≥ 280 / 0.9 ≈ 311
    // 我们用 460 (上一条的下限) 作为更松的"起码"门 — 已涵盖。
    const distances = Object.values(PERSON_POS).map((p) => Math.hypot(p.x - CENTER.x, p.y - CENTER.y))
    const minDist = Math.min(...distances)
    expect(minDist).toBeGreaterThanOrEqual(460) // 见上一条
  })
})

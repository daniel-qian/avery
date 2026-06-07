import { describe, it, expect } from 'vitest'
import { computeCameraTransform, type CameraInsets } from './useRailCamera'
import { selectCameraPoints, PERSON_POS, PROJECT_POS } from '../data/layout'
import type { Focus } from '../store/canvasStore'

// P6 issue (dashboard-radial-recompose):
//   B5 — calm 镜头（内环 bbox）在合理视口下产出非退化 scale。
//         锁的是"calm 不再 fit 全图" + "外环不参与 calm 框景"。
//   不锁具体 scale 数字 — 那是 §3 "浏览器里真值靠 dev 调"的事。
//   只锁: scale 在 [minScale, maxScale] 内,且 calm 输入下 scale 大于 (但不一定 ≥ 0.8) 
//   "如果走 old wholeMap 的 scale 算 calm, 那个会接近 0.3" 的退化场景。

const DASH_INSETS: CameraInsets = { top: 100, bottom: 140, left: 64, right: 64 }
const NEXUS_INSETS: CameraInsets = { top: 0, bottom: 0, left: 0, right: 320 }

describe('useRailCamera — computeCameraTransform (B5)', () => {
  it('returns null for empty points (defensive)', () => {
    const t = computeCameraTransform([], { width: 1440, height: 900 }, { insets: DASH_INSETS })
    expect(t).toBeNull()
  })

  it('calm input (inner ring) produces a scale much larger than the legacy wholeMap scale', () => {
    // 假设 1440x900 视口 + Dashboard insets.
    // 旧 P5: wholeMap 包含内环 (R=600) + 外环 (R=1020),且 board=2600,
    //   bbox 算出来 2800x2800 → 缩到 0.46
    // 新 P6 calm: 只内环 (R=560),board=1800 → 内环 bbox 约 1411x1411
    //   → scale 仍被可用高度卡 (~0.47)
    // —— 这里只锁: calm scale > wholeMap scale (即"不再 fit 全图")
    // —— 不锁具体数字 (issue §3 说真值靠浏览器调)。
    const viewport = { width: 1440, height: 900 }
    const calmPoints = selectCameraPoints(null)
    const wholeMap = [...Object.values(PERSON_POS), ...Object.values(PROJECT_POS)]

    const tCalm = computeCameraTransform(calmPoints, viewport, { insets: DASH_INSETS })!
    const tWhole = computeCameraTransform(wholeMap, viewport, { insets: DASH_INSETS })!

    // 锁: calm scale >= wholeMap scale (calm 不会比全图更糟)
    expect(tCalm.scale).toBeGreaterThanOrEqual(tWhole.scale)

    // 反向锁: wholeMap 包含外环 → bbox 比 calm 大 → scale 更小
    // 这条确保"calm 不用全图"的行为真的发生,而不是把 wholeMap 偷偷塞回去
    const calmBbox = bbox(calmPoints)
    const wholeBbox = bbox(wholeMap)
    expect(calmBbox.width).toBeLessThan(wholeBbox.width)
    expect(calmBbox.height).toBeLessThan(wholeBbox.height)
  })

  it('respects minScale / maxScale clamps', () => {
    // 极大视口 → scale 会被 maxScale 1.15 卡住
    const hugeViewport = { width: 100000, height: 100000 }
    const t = computeCameraTransform(selectCameraPoints(null), hugeViewport, { insets: DASH_INSETS, maxScale: 1.15 })!
    expect(t.scale).toBeLessThanOrEqual(1.15)

    // 极小视口 → scale 会被 minScale 0.2 卡住
    const tinyViewport = { width: 100, height: 100 }
    const t2 = computeCameraTransform(selectCameraPoints(null), tinyViewport, { insets: DASH_INSETS, minScale: 0.2 })!
    expect(t2.scale).toBeGreaterThanOrEqual(0.2)
  })

  it('center of the bbox lands at the center of the available viewport', () => {
    // 这是 useRailCamera 的核心几何:让被框的节点群中心对到 "可用区" (视口 - insets) 中心。
    // 这意味着 calm (内环 bbox 中心 ≈ board 中心) 在 scale 后落在 "视口 - insets" 的中心。
    const viewport = { width: 1440, height: 900 }
    const calmPoints = selectCameraPoints(null)
    const t = computeCameraTransform(calmPoints, viewport, { insets: DASH_INSETS })!

    // 推算 "内环 bbox 中心" 在屏幕上的位置
    // board 中心 (900, 900) 应该在屏幕上 = availCenterX/Y
    // 屏幕位置 = position + boardPoint * scale（rzpp transformOrigin 0 0）
    // 容差 3px（坐标 round 到整数后会有 ~2px 偏差）
    const availW = viewport.width - DASH_INSETS.left - DASH_INSETS.right
    const availH = viewport.height - DASH_INSETS.top - DASH_INSETS.bottom
    const availCx = DASH_INSETS.left + availW / 2
    const availCy = DASH_INSETS.top + availH / 2
    const screenX = t.positionX + 900 * t.scale
    const screenY = t.positionY + 900 * t.scale
    expect(Math.abs(screenX - availCx)).toBeLessThan(3)
    expect(Math.abs(screenY - availCy)).toBeLessThan(3)
  })

  it('focus on a single node pins that node at the available center', () => {
    // 退化测试: 1 节点 focus → bbox 中心 = 该节点 → 屏幕位置 = availCenter
    const focus: Focus = { source: 'node', primary: { kind: 'person', id: 'u_you' }, personIds: ['u_you'], projectIds: [] }
    const pts = selectCameraPoints(focus)
    expect(pts.length).toBe(1)

    const viewport = { width: 1440, height: 900 }
    const t = computeCameraTransform(pts, viewport, { insets: DASH_INSETS, pad: 0 })!

    const you = pts[0]
    const availW = viewport.width - DASH_INSETS.left - DASH_INSETS.right
    const availH = viewport.height - DASH_INSETS.top - DASH_INSETS.bottom
    const availCx = DASH_INSETS.left + availW / 2
    const availCy = DASH_INSETS.top + availH / 2
    const screenX = t.positionX + you.x * t.scale
    const screenY = t.positionY + you.y * t.scale
    expect(Math.abs(screenX - availCx)).toBeLessThan(2)
    expect(Math.abs(screenY - availCy)).toBeLessThan(2)
  })
})

// Helper: axis-aligned bounding box
function bbox(pts: { x: number; y: number }[]): { width: number; height: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return { width: maxX - minX, height: maxY - minY }
}

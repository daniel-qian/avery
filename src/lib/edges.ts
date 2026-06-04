export interface Pt {
  x: number
  y: number
}

// 二次贝塞尔：owner → project 的柔和弧线（控制点上提）。
// 坐标用 viewBox 0–100 单位（与布局的 % 一致），SvgEdgeLayer 用 preserveAspectRatio=none。
// 移植自 prototype-vanilla/app.js 的 drawDashboardEdges。
export function edgePath(from: Pt, to: Pt): string {
  const cx = (from.x + to.x) / 2
  const cy = Math.min(from.y, to.y) - 8
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
}

import { useLayoutEffect, type RefObject } from 'react'
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch'
import type { Pos } from '../data/layout'
import { CALM_HOME_SCALE, CALM_HOME_TARGET } from '../data/layout'

// P5 ④⑤（ADR-0012）：rail 推进派生镜头（camera-on-rail）。
// 镜头目标 = 当前 step（Nexus：thread.steps 末项活跃簇）/ focus（Dashboard）的纯函数：
// 由活跃节点的 board 坐标算包围盒 → 经 rzpp ref setTransform 动画 fit 进「可用视口」
// （扣掉 chrome 占的 inset，Nexus 右侧让出 inspector gutter）。
//
// 纯派生、不入 store（守 P5 铁律 + ADR-0006 replay-safe）：effect dep 只认派生出的 key，
// seek 倒带后镜头自洽重算；手动 pan 后下一拍 rail 再把镜头收回——与 focus 同构。

export interface CameraInsets {
  top: number
  bottom: number
  left: number
  right: number
}

interface CameraOptions {
  insets: CameraInsets
  pad?: number // 包围盒外扩（≈ 卡片半宽 + 余白），避免卡片贴边被裁
  minScale?: number
  maxScale?: number
  animationTime?: number
  enabled?: boolean
  /**
   * P6 (issue dashboard-radial-recompose §2-B)：
   *   calm 镜头走硬编码 home transform，不做 bbox fit（issue §0 几何根因）。
   *   默认 false —— 除非显式打开，否则一律 bbox fit。
   *   打开后，calm (focus === null) 时 scale 固定为 `calmHomeScale`，
   *   position 把 nucleus 中心对到可用区中心。
   */
  useCalmHomeTransform?: boolean
  calmHomeScale?: number
}

export interface CameraTransform {
  positionX: number
  positionY: number
  scale: number
}

// P6（issue dashboard-radial-recompose §2-B 提取测试面）：
//   镜头目标 = points 的 bbox → fit 到「可用视口」（视口扣 insets）。
//   把这个纯函数从 hook 内部提出来，让 §4 项 1 "calm scale 可读"+ 项 4 "外环允许溢出"
//   落进合同——测试时无需 jsdom + renderHook。
export function computeCameraTransform(
  points: Pos[],
  viewport: { width: number; height: number },
  options: CameraOptions,
): CameraTransform | null {
  if (points.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const pad = options.pad ?? 150
  minX -= pad
  minY -= pad
  maxX += pad
  maxY += pad
  const bw = Math.max(1, maxX - minX)
  const bh = Math.max(1, maxY - minY)

  const minScale = options.minScale ?? 0.2
  const maxScale = options.maxScale ?? 1.15
  const availW = Math.max(1, viewport.width - options.insets.left - options.insets.right)
  const availH = Math.max(1, viewport.height - options.insets.top - options.insets.bottom)
  const scale = Math.max(minScale, Math.min(maxScale, Math.min(availW / bw, availH / bh)))

  // rzpp 变换：screen = position + boardPoint * scale（transformOrigin 0 0）。
  // 把包围盒中心对到「可用区」中心（可用区 = 视口扣掉各侧 inset）。
  const availCenterX = options.insets.left + availW / 2
  const availCenterY = options.insets.top + availH / 2
  const bcx = (minX + maxX) / 2
  const bcy = (minY + maxY) / 2
  const positionX = availCenterX - bcx * scale
  const positionY = availCenterY - bcy * scale

  return { positionX, positionY, scale }
}

export function useRailCamera(
  ref: RefObject<ReactZoomPanPinchContentRef | null>,
  points: Pos[],
  key: string,
  options: CameraOptions,
) {
  const {
    insets,
    pad = 150,
    minScale = 0.2,
    maxScale = 1.15,
    animationTime = 620,
    enabled = true,
    useCalmHomeTransform = false,
    calmHomeScale = CALM_HOME_SCALE,
  } = options

  // P6（issue dashboard-radial-recompose）：用 useLayoutEffect 而不是 useEffect + rAF
  //   —— 浏览器绘制前同步接管镜头，避免"先闪一下 initialScale / centerOnInit 的全图鸟瞰"
  //   再被 useRailCamera 拉近。layout phase 跑完才 commit paint。
  useLayoutEffect(() => {
    if (!enabled || points.length === 0) return
    const api = ref.current
    const wrapper = api?.instance.wrapperComponent
    if (!api || !wrapper) return

    // 同步重试几帧拿 wrapper 尺寸（scene 切换首帧可能未测出）
    let attempts = 0
    const tryApply = () => {
      const w = wrapper.clientWidth
      const h = wrapper.clientHeight
      if ((!w || !h) && attempts < 8) {
        attempts += 1
        // 必须在 paint 前重试 → 用 microtask + 同步 layout flush
        queueMicrotask(tryApply)
        return
      }
      if (!w || !h) return

      // P6 calm home transform: 当 focus === null 且开启 useCalmHomeTransform
      // → 跳过 bbox fit,直接 position 把 nucleus 中心 (board 900,900) 对到
      //   视口可用区中心,scale 固定 calmHomeScale (默认 0.85)。
      // 这是 issue §2-B 原文的"以 nucleus 为中心、scale≈0.9 的固定 home transform"。
      const isCalm = points.length === 1 && points[0] === CALM_HOME_TARGET
      let transform: CameraTransform | null
      if (useCalmHomeTransform && isCalm) {
        const availW = Math.max(1, w - insets.left - insets.right)
        const availH = Math.max(1, h - insets.top - insets.bottom)
        const availCx = insets.left + availW / 2
        const availCy = insets.top + availH / 2
        transform = {
          positionX: availCx - CALM_HOME_TARGET.x * calmHomeScale,
          positionY: availCy - CALM_HOME_TARGET.y * calmHomeScale,
          scale: calmHomeScale,
        }
      } else {
        transform = computeCameraTransform(points, { width: w, height: h }, { insets, pad, minScale, maxScale })
      }
      if (!transform) return
      // 第一帧（attempts === 0）零动画瞬切，避免 initial 闪全图
      const useAnimation = attempts > 0 ? animationTime : 0
      api.setTransform(transform.positionX, transform.positionY, transform.scale, useAnimation, 'easeOut')
    }
    tryApply()
  }, [key, enabled, points, insets, pad, minScale, maxScale, animationTime, useCalmHomeTransform, calmHomeScale, ref])
}

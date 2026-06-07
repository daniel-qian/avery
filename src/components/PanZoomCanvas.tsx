import { forwardRef, type ReactNode } from 'react'
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchContentRef,
} from 'react-zoom-pan-pinch'
import type { BoardSize } from '../data/layout'

// P5 ⑥ (ADR-0012)：Dashboard 与 Nexus 共用的可平移/缩放画板基座。
// 只把「实体节点 + 连线 SVG」放进 <TransformComponent>；其余 chrome（Topbar / composer /
// briefing / inspector / advance / tags …）留在外面当 viewport-fixed 浮层。
// forwardRef 暴露 ReactZoomPanPinchContentRef 给 useRailCamera 做派生镜头（zoomToElement / setTransform）。
// 镜头 / pan / zoom 交互态全走 rzpp 内部 ref，不进 canvasStore（守 P5 铁律 + ADR-0006 replay-safe）。

interface PanZoomCanvasProps {
  board: BoardSize
  children: ReactNode
  initialScale?: number
  minScale?: number
  maxScale?: number
  centerOnInit?: boolean
}

export const PanZoomCanvas = forwardRef<ReactZoomPanPinchContentRef, PanZoomCanvasProps>(
  function PanZoomCanvas(
    {
      board,
      children,
      initialScale = 0.7,
      minScale = 0.2,
      maxScale = 2,
      centerOnInit = false, // P6: useRailCamera 接管镜头,不让 rzpp 默认居中整个 board（那会让 calm 看起来像全图鸟瞰）
    },
    ref,
  ) {
    return (
      <TransformWrapper
        ref={ref}
        initialScale={initialScale}
        minScale={minScale}
        maxScale={maxScale}
        limitToBounds={false}
        centerOnInit={centerOnInit}
        doubleClick={{ disabled: true }}
        wheel={{ step: 0.08 }}
        panning={{ velocityDisabled: true }}
      >
        <TransformComponent
          wrapperClass="panzoom-wrapper"
          contentClass="panzoom-content"
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: `${board.width}px`, height: `${board.height}px` }}
        >
          {children}
        </TransformComponent>
      </TransformWrapper>
    )
  },
)

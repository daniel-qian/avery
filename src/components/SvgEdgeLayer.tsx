import { PROJECTS } from '../data/fixtures'
import { PERSON_POS, PROJECT_POS } from '../data/layout'
import { BOARD } from '../data/board'
import { edgePath } from '../lib/edges'
import { useCanvas } from '../store/canvasStore'

function classNames(parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// owner → project 连线层。P5 (ADR-0012)：viewBox 改为 board 尺寸，path 用 board px 坐标
// （随镜头一起缩放）。vector-effect=non-scaling-stroke 保证线宽不被 zoom 拉伸。
export function SvgEdgeLayer() {
  const focus = useCanvas((s) => s.focus)
  return (
    <svg
      className="edge-layer"
      viewBox={`0 0 ${BOARD.width} ${BOARD.height}`}
      aria-hidden="true"
    >
      {PROJECTS.map((p) => {
        const from = PERSON_POS[p.ownerId]
        const to = PROJECT_POS[p.id]
        if (!from || !to) return null
        const related = focus
          ? focus.projectIds.includes(p.id) || focus.personIds.includes(p.ownerId)
          : false
        return (
          <path
            key={p.id}
            className={classNames([
              'edge-path',
              focus && !related && 'is-muted',
              related && 'is-related',
            ])}
            d={edgePath(from, to)}
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}

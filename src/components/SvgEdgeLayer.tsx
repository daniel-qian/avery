import { PROJECTS } from '../data/fixtures'
import { PERSON_POS, PROJECT_POS } from '../data/layout'
import { edgePath } from '../lib/edges'
import { useCanvas } from '../store/canvasStore'

function classNames(parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// owner → project 连线层。viewBox 0–100 + preserveAspectRatio=none：
// path 直接用布局的 % 坐标，无需测像素；vector-effect 保证线宽不被拉伸。
export function SvgEdgeLayer() {
  const focus = useCanvas((s) => s.focus)
  return (
    <svg
      className="edge-layer"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
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

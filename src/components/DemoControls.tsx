import { useLayoutEffect } from 'react'
import { SCRIPT, useRail } from '../store/railStore'

const FREE_CLICK_BEATS = new Set(['B2', 'B9'])
const BEAT_SEQUENCE = SCRIPT.reduce<string[]>((beats, step) => {
  if (beats.includes(step.beat)) return beats
  return [...beats, step.beat]
}, [])
const BEAT_TOTAL = BEAT_SEQUENCE.length

function getCaptionParts(index: number) {
  const step = SCRIPT[index]
  const beatIndex = BEAT_SEQUENCE.indexOf(step.beat) + 1
  const stepsInBeat = SCRIPT.filter((candidate) => candidate.beat === step.beat).length
  const stepInBeat = SCRIPT.slice(0, index + 1).filter((candidate) => candidate.beat === step.beat).length

  return {
    label: step.label,
    beatProgress: `${beatIndex} / ${BEAT_TOTAL}`,
    subProgress: stepsInBeat > 1 ? `${stepInBeat}/${stepsInBeat}` : null,
    isFreeClick: FREE_CLICK_BEATS.has(step.beat),
  }
}

export function DemoControls() {
  const index = useRail((s) => s.index)
  const hidden = useRail((s) => s.hidden)
  const caption = getCaptionParts(index)

  useLayoutEffect(() => {
    useRail.getState().seek(0)
  }, [])

  useLayoutEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return

      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        useRail.getState().next()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        useRail.getState().prev()
      } else if (event.key.toLowerCase() === 'r') {
        useRail.getState().restart()
      } else if (event.key.toLowerCase() === 'h') {
        useRail.getState().toggleHidden()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (hidden) return null

  return (
    <aside className="demo-controls rail-controls" aria-label="Demo rail progress">
      <div className="rail-caption" aria-live="polite">
        <strong>{caption.label}</strong>
        <span aria-hidden="true">·</span>
        <small>{caption.beatProgress}</small>
        {caption.subProgress ? (
          <>
            <span aria-hidden="true">·</span>
            <small>{caption.subProgress}</small>
          </>
        ) : null}
        {caption.isFreeClick ? (
          <>
            <span aria-hidden="true">·</span>
            <em>→ your turn · free-click</em>
          </>
        ) : null}
      </div>
    </aside>
  )
}

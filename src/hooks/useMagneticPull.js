import { useEffect, useRef } from 'react'

// Magnetic pull: the element's inner content leans toward the cursor while
// hovered, then springs back on leave. Same spring curve as the glass toggle
// knob (cubic-bezier(0.3, 1.4, 0.5, 1)) so every liquid component feels alike.
// Smoothing runs on rAF with a lerp (not CSS transition) so fast cursor
// movement stays fluid instead of queueing transitions. Static when the user
// prefers reduced motion.
export default function useMagneticPull(maxPullPx = 6) {
  const elementRef = useRef(null)
  const stateRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, frame: 0, hovering: false })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const state = stateRef.current

    const tick = () => {
      state.x += (state.targetX - state.x) * 0.2
      state.y += (state.targetY - state.y) * 0.2
      element.style.setProperty('--mag-x', `${state.x.toFixed(2)}px`)
      element.style.setProperty('--mag-y', `${state.y.toFixed(2)}px`)
      const settled = Math.abs(state.targetX - state.x) < 0.05 && Math.abs(state.targetY - state.y) < 0.05
      if (settled && !state.hovering) {
        element.style.setProperty('--mag-x', '0px')
        element.style.setProperty('--mag-y', '0px')
        state.frame = 0
        return
      }
      state.frame = requestAnimationFrame(tick)
    }
    const startLoop = () => {
      if (!state.frame) state.frame = requestAnimationFrame(tick)
    }

    const onPointerMove = (event) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const offsetX = (event.clientX - centerX) / (rect.width / 2)
      const offsetY = (event.clientY - centerY) / (rect.height / 2)
      const clampedX = Math.max(-1, Math.min(1, offsetX))
      const clampedY = Math.max(-1, Math.min(1, offsetY))
      state.targetX = clampedX * maxPullPx
      state.targetY = clampedY * maxPullPx
      state.hovering = true
      startLoop()
    }
    const onPointerLeave = () => {
      state.targetX = 0
      state.targetY = 0
      state.hovering = false
      startLoop()
    }

    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerleave', onPointerLeave)
    return () => {
      cancelAnimationFrame(state.frame)
      state.frame = 0
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [maxPullPx])

  return elementRef
}

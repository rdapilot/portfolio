import { useEffect, useRef } from 'react'

// Non-interactive liquid-glass orbs that flee the cursor. Pure decoration:
// pointer-events stay none so they never block clicks. Each orb runs the same
// spring physics as the grain field (repel inside a radius, spring home,
// exponential damping) plus a velocity goo-stretch — the orb elongates along
// its motion like the toggle knob's goo keyframes, but continuous. Static
// when the user prefers reduced motion.

// --- Tuning ---------------------------------------------------------------
const FLEE_RADIUS_PX = 170
const PUSH_FORCE = 2600
const SPRING_STIFFNESS = 14

// Homes in % viewport coords + size + tint. Kept near edges/corners so orbs
// frame the scene instead of covering the planets and hero copy.
const ORBS = [
  { left: '9%', top: '32%', size: 92, tint: '170, 59, 255' },
  { left: '87%', top: '24%', size: 64, tint: '34, 211, 238' },
  { left: '80%', top: '72%', size: 110, tint: '232, 154, 107' },
  { left: '12%', top: '74%', size: 58, tint: '127, 217, 123' },
  { left: '50%', top: '10%', size: 44, tint: '255, 255, 255' },
]

export default function FleeingGlassOrbs() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const nodes = Array.from(container.children)
    const cursor = { x: -9999, y: -9999 }
    // Per-orb sim state; DOM nodes are positioned by transform only.
    const sims = nodes.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, angle: 0 }))
    let animationFrame = 0
    let lastTimestamp = 0

    const onPointerMove = (event) => {
      cursor.x = event.clientX
      cursor.y = event.clientY
    }
    const onPointerLeave = () => {
      cursor.x = -9999
      cursor.y = -9999
    }
    window.addEventListener('pointermove', onPointerMove)
    document.addEventListener('mouseleave', onPointerLeave)

    const frame = (now) => {
      animationFrame = requestAnimationFrame(frame)
      const deltaSeconds = Math.min(0.05, (now - (lastTimestamp || now)) / 1000)
      lastTimestamp = now
      const damping = Math.exp(-5 * deltaSeconds)

      nodes.forEach((node, i) => {
        const sim = sims[i]
        // getBoundingClientRect already includes our transform offset, so the
        // rect centre is the orb's true on-screen centre.
        const rect = node.getBoundingClientRect()
        const dx = rect.left + rect.width / 2 - cursor.x
        const dy = rect.top + rect.height / 2 - cursor.y
        const distanceSq = dx * dx + dy * dy
        if (distanceSq < FLEE_RADIUS_PX * FLEE_RADIUS_PX) {
          const distance = Math.sqrt(distanceSq) || 1
          const falloff = 1 - distance / FLEE_RADIUS_PX
          const push = PUSH_FORCE * falloff * falloff * deltaSeconds
          sim.vx += (dx / distance) * push
          sim.vy += (dy / distance) * push
          // Curl: a tangential swirl (alternating per orb) bends the escape
          // into a curve instead of a straight radial dash.
          const swirl = i % 2 === 0 ? 1 : -1
          sim.vx += (-dy / distance) * push * 0.35 * swirl
          sim.vy += (dx / distance) * push * 0.35 * swirl
        }
        sim.vx += (0 - sim.x) * SPRING_STIFFNESS * deltaSeconds
        sim.vy += (0 - sim.y) * SPRING_STIFFNESS * deltaSeconds
        sim.vx *= damping
        sim.vy *= damping
        sim.x += sim.vx * deltaSeconds
        sim.y += sim.vy * deltaSeconds

        // Goo stretch: elongate along travel, squash across it.
        const speed = Math.hypot(sim.vx, sim.vy)
        if (speed > 40) sim.angle = Math.atan2(sim.vy, sim.vx)
        const stretch = Math.min(0.32, speed / 2600)
        node.style.transform =
          `translate(${sim.x.toFixed(1)}px, ${sim.y.toFixed(1)}px) ` +
          `rotate(${sim.angle.toFixed(3)}rad) ` +
          `scale(${(1 + stretch).toFixed(3)}, ${(1 - stretch * 0.8).toFixed(3)})`
      })
    }
    animationFrame = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [])

  return (
    <div className="flee-orbs" aria-hidden="true" ref={containerRef}>
      {ORBS.map((orb, index) => (
        <span
          key={index}
          className="flee-orb"
          style={{
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            '--orb-tint': orb.tint,
          }}
        />
      ))}
    </div>
  )
}

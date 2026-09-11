import { useEffect, useRef } from 'react'

// Animated circuit-board light streaks on a fullscreen 2D canvas.
// How it works: five hard-coded polyline traces are drawn faintly every
// frame; a single bright "pulse" travels along a random trace with a fading
// trail, then pauses 1.5–3.5s before the next run. Respects
// prefers-reduced-motion by rendering static traces only.

// --- Tuning ---------------------------------------------------------------
const PULSE_SPEED_PX_PER_SEC = 320
const TRAIL_LENGTH_PX = 90
const TRAIL_STEPS = 14

// Traces in normalized (0..1) viewport coordinates so they survive resizes.
const TRACE_DEFINITIONS = [
  [[0.04, 0.22], [0.22, 0.22], [0.3, 0.3], [0.3, 0.52], [0.18, 0.64]],
  [[0.72, 0.12], [0.72, 0.3], [0.84, 0.42], [0.84, 0.66]],
  [[0.08, 0.78], [0.26, 0.78], [0.34, 0.86], [0.55, 0.86]],
  [[0.62, 0.7], [0.78, 0.7], [0.9, 0.82], [0.9, 0.94]],
  [[0.4, 0.08], [0.52, 0.08], [0.6, 0.16], [0.6, 0.34]],
]

// Convert normalized trace definitions to pixel polylines + segment lengths.
function buildTraces(viewportWidth, viewportHeight) {
  return TRACE_DEFINITIONS.map((points) => {
    const pixels = points.map(([fx, fy]) => [fx * viewportWidth, fy * viewportHeight])
    const segments = []
    let total = 0
    for (let i = 1; i < pixels.length; i += 1) {
      const length = Math.hypot(pixels[i][0] - pixels[i - 1][0], pixels[i][1] - pixels[i - 1][1])
      segments.push(length)
      total += length
    }
    return { pixels, segments, total }
  })
}

// Arc-length lookup: walk segments until distance d, then lerp within it.
function pointAtDistance(trace, distance) {
  let accumulated = 0
  for (let i = 0; i < trace.segments.length; i += 1) {
    if (distance <= accumulated + trace.segments[i] || i === trace.segments.length - 1) {
      const t = trace.segments[i]
        ? Math.min(1, Math.max(0, (distance - accumulated) / trace.segments[i]))
        : 0
      const [x0, y0] = trace.pixels[i]
      const [x1, y1] = trace.pixels[i + 1]
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]
    }
    accumulated += trace.segments[i]
  }
  return trace.pixels[trace.pixels.length - 1]
}

export default function CircuitStreaks() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    // Cap DPR at 2: full retina is overkill for 1px lines.
    const devicePixelRatio = Math.min(2, window.devicePixelRatio || 1)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let viewportWidth = 0
    let viewportHeight = 0
    let animationFrame = 0
    let lastTimestamp = 0
    let traces = []
    let pulse = null
    let nextPulseAt = performance.now() + 1200

    const rebuildForSize = () => {
      traces = buildTraces(viewportWidth, viewportHeight)
    }

    const resize = () => {
      viewportWidth = window.innerWidth
      viewportHeight = window.innerHeight
      canvas.width = viewportWidth * devicePixelRatio
      canvas.height = viewportHeight * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      rebuildForSize()
    }
    resize()
    window.addEventListener('resize', resize)

    const drawTraceUnderlay = () => {
      traces.forEach((trace) => {
        ctx.strokeStyle = 'rgba(150,130,255,0.055)'
        ctx.lineWidth = 1
        ctx.beginPath()
        trace.pixels.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        ctx.stroke()
        // Node pads at each vertex sell the "circuit" look.
        ctx.fillStyle = 'rgba(150,130,255,0.07)'
        trace.pixels.forEach(([x, y]) => ctx.fillRect(x - 1.5, y - 1.5, 3, 3))
      })
    }

    const spawnPulseIfDue = (now) => {
      if (pulse || now < nextPulseAt) return
      const trace = traces[Math.floor(Math.random() * traces.length)]
      const forward = Math.random() < 0.5
      pulse = { trace, distance: forward ? 0 : trace.total, direction: forward ? 1 : -1, born: now }
    }

    const drawPulse = (now, deltaSeconds) => {
      pulse.distance += pulse.direction * PULSE_SPEED_PX_PER_SEC * deltaSeconds
      const finished = pulse.direction > 0 ? pulse.distance >= pulse.trace.total : pulse.distance <= 0
      if (finished) {
        pulse = null
        nextPulseAt = now + 1500 + Math.random() * 2000
        return
      }
      const remaining = pulse.direction > 0 ? pulse.trace.total - pulse.distance : pulse.distance
      // Fade in over 250ms after birth, fade out over the last 120px.
      const alpha =
        0.55 * Math.min(1, (now - pulse.born) / 250) * Math.min(1, remaining / 120)
      for (let step = TRAIL_STEPS; step >= 1; step -= 1) {
        const segmentAlpha = alpha * Math.pow(1 - step / (TRAIL_STEPS + 1), 2)
        if (segmentAlpha < 0.01) continue
        const [x0, y0] = pointAtDistance(pulse.trace, pulse.distance - pulse.direction * ((step * TRAIL_LENGTH_PX) / TRAIL_STEPS))
        const [x1, y1] = pointAtDistance(
          pulse.trace,
          pulse.distance - pulse.direction * (((step - 1) * TRAIL_LENGTH_PX) / TRAIL_STEPS),
        )
        ctx.strokeStyle = `rgba(190,170,255,${segmentAlpha.toFixed(3)})`
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.stroke()
      }
      // Bright head with a soft shadow glow.
      const [headX, headY] = pointAtDistance(pulse.trace, pulse.distance)
      ctx.save()
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(170,140,255,0.9)'
      ctx.fillStyle = `rgba(235,230,255,${Math.min(1, alpha + 0.25).toFixed(3)})`
      ctx.fillRect(headX - 1.5, headY - 1.5, 3, 3)
      ctx.restore()
    }

    const frame = (now) => {
      animationFrame = requestAnimationFrame(frame)
      const deltaSeconds = Math.min(0.05, (now - (lastTimestamp || now)) / 1000)
      lastTimestamp = now
      ctx.clearRect(0, 0, viewportWidth, viewportHeight)
      drawTraceUnderlay()
      if (prefersReducedMotion) return
      spawnPulseIfDue(now)
      if (pulse) drawPulse(now, deltaSeconds)
    }
    animationFrame = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="circuit-streaks" aria-hidden="true" />
}

import { useEffect, useRef } from 'react'

// Prominent film grain: two stacked textures on the fixed analog overlay.
// Layer 1 — VHS noise: fine soft chromatic speckle (independent random per
// channel, magenta/cyan skewed like tape chroma noise) composited with
// 'overlay', plus drifting chroma-smear blobs and an occasional horizontal
// tracking glitch. Layer 2 — tiny tinted dust flecks fleeing the cursor on
// springs. Static single frame when the user prefers reduced motion.

// --- Tuning ---------------------------------------------------------------
// Tile at half res drawn smoothed: soft ~1px tooth, not crisp pixels.
const NOISE_SCALE_DOWN = 2
const NOISE_EVERY_N_FRAMES = 3 // gentle shimmer, no flicker assault
const NOISE_AMOUNT = 62 // per-channel spread around neutral 128
const NOISE_STRENGTH = 0.2 // overlay layer opacity (color needs a touch more)
// VHS tracking glitch: brief bright line + noise surge every few seconds.
const GLITCH_MIN_GAP_MS = 5000
const GLITCH_MAX_GAP_MS = 9000
const GLITCH_DURATION_MS = 260
// Slow chroma-smear blobs (tint, base position, drift speed).
const CHROMA_BLOBS = [
  { tint: '255, 80, 200', x: 0.25, y: 0.3, size: 300, speed: 0.11, phase: 0.0 },
  { tint: '60, 220, 255', x: 0.7, y: 0.65, size: 360, speed: 0.08, phase: 2.1 },
  { tint: '150, 100, 255', x: 0.55, y: 0.2, size: 260, speed: 0.13, phase: 4.2 },
]
const CHROMA_STRENGTH = 0.04

const DUST_COUNT = 1100
const DUST_MIN_SIZE = 1
const DUST_MAX_SIZE = 2.5
const DUST_MIN_ALPHA = 0.05
const DUST_MAX_ALPHA = 0.16
// Iridescent flecks instead of flat gray — mostly starlight white with
// occasional lavender, ice-cyan, and warm-ember tints.
const DUST_TINTS = ['#ffffff', '#ffffff', '#ffffff', '#e6d6ff', '#c9ecff', '#ffd9b8']
const MOUSE_RADIUS_PX = 170
const PUSH_FORCE = 2200
const SPRING_STIFFNESS = 20

function buildDust(viewportWidth, viewportHeight) {
  const dust = Array.from({ length: DUST_COUNT }, () => ({
    homeX: Math.random() * viewportWidth,
    homeY: Math.random() * viewportHeight,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: DUST_MIN_SIZE + Math.random() * (DUST_MAX_SIZE - DUST_MIN_SIZE),
    alpha: DUST_MIN_ALPHA + Math.random() * (DUST_MAX_ALPHA - DUST_MIN_ALPHA),
    tint: DUST_TINTS[Math.floor(Math.random() * DUST_TINTS.length)],
    phase: Math.random() * Math.PI * 2,
  }))
  dust.forEach((particle) => {
    particle.x = particle.homeX
    particle.y = particle.homeY
  })
  return dust
}

export default function GrainField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Offscreen noise tile, kept tiny on purpose.
    const noiseCanvas = document.createElement('canvas')
    const noiseCtx = noiseCanvas.getContext('2d')
    let noiseImage = null
    let viewportWidth = 0
    let viewportHeight = 0
    let animationFrame = 0
    let lastTimestamp = 0
    let frameCount = 0
    let glitchUntil = 0
    let glitchY = 0
    let nextGlitchAt = performance.now() + 4000
    let dust = []
    // Smoothed cursor copies — viscous, not twitchy.
    const mouse = { x: -9999, y: -9999, smoothX: -9999, smoothY: -9999 }

    const regenerateNoise = () => {
      const pixels = noiseImage.data
      for (let i = 0; i < pixels.length; i += 4) {
        // Chromatic speckle: each channel rolls its own random so the grain
        // shimmers color (tape chroma noise), never flat gray. Blue/red run
        // slightly hot, the classic VHS magenta/cyan skew.
        pixels[i] = 128 + (Math.random() - 0.5) * 2 * NOISE_AMOUNT * 1.1
        pixels[i + 1] = 128 + (Math.random() - 0.5) * 2 * NOISE_AMOUNT * 0.9
        pixels[i + 2] = 128 + (Math.random() - 0.5) * 2 * NOISE_AMOUNT * 1.2
        pixels[i + 3] = 255
      }
      noiseCtx.putImageData(noiseImage, 0, 0)
    }

    const drawNoise = (strengthMultiplier = 1) => {
      ctx.save()
      // Smoothing ON: the half-res tile blooms into soft ~1px tooth, the way
      // tape smears grain instead of resolving hard pixels.
      ctx.imageSmoothingEnabled = true
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = Math.min(1, NOISE_STRENGTH * strengthMultiplier)
      ctx.drawImage(noiseCanvas, 0, 0, viewportWidth, viewportHeight)
      ctx.restore()
    }

    const drawChromaSmear = (time) => {
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = CHROMA_STRENGTH
      CHROMA_BLOBS.forEach((blob) => {
        // Slow lissajous drift so the color clouds never sit still.
        const x = viewportWidth * (blob.x + 0.12 * Math.sin(time * blob.speed + blob.phase))
        const y = viewportHeight * (blob.y + 0.1 * Math.cos(time * blob.speed * 1.3 + blob.phase))
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, blob.size)
        gradient.addColorStop(0, `rgba(${blob.tint},0.9)`)
        gradient.addColorStop(1, `rgba(${blob.tint},0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(x - blob.size, y - blob.size, blob.size * 2, blob.size * 2)
      })
      ctx.restore()
    }

    const drawDustStatic = () => {
      dust.forEach((particle) => {
        ctx.fillStyle = particle.tint
        ctx.globalAlpha = particle.alpha
        ctx.fillRect(particle.homeX, particle.homeY, particle.size, particle.size)
      })
      ctx.globalAlpha = 1
    }

    const resize = () => {
      viewportWidth = window.innerWidth
      viewportHeight = window.innerHeight
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = viewportWidth * dpr
      canvas.height = viewportHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      noiseCanvas.width = Math.max(1, Math.ceil(viewportWidth / NOISE_SCALE_DOWN))
      noiseCanvas.height = Math.max(1, Math.ceil(viewportHeight / NOISE_SCALE_DOWN))
      noiseImage = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height)
      dust = buildDust(viewportWidth, viewportHeight)
      regenerateNoise()
      if (prefersReducedMotion) {
        ctx.clearRect(0, 0, viewportWidth, viewportHeight)
        drawNoise()
        drawChromaSmear(0)
        drawDustStatic()
      }
    }
    resize()
    window.addEventListener('resize', resize)

    if (prefersReducedMotion) return () => window.removeEventListener('resize', resize)

    const onPointerMove = (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }
    const onPointerLeave = () => {
      mouse.x = mouse.y = mouse.smoothX = mouse.smoothY = -9999
    }
    window.addEventListener('pointermove', onPointerMove)
    document.addEventListener('mouseleave', onPointerLeave)

    const frame = (now) => {
      animationFrame = requestAnimationFrame(frame)
      const deltaSeconds = Math.min(0.05, (now - (lastTimestamp || now)) / 1000)
      lastTimestamp = now
      frameCount += 1
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.18
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.18
      const damping = Math.exp(-6 * deltaSeconds)
      const time = now / 1000
      ctx.clearRect(0, 0, viewportWidth, viewportHeight)
      // Fresh noise tile on schedule, plus a VHS tracking glitch every few
      // seconds: bright rolling line + a surge of fresh noise while it lasts.
      const glitching = now < glitchUntil
      if (frameCount % NOISE_EVERY_N_FRAMES === 0 || glitching) regenerateNoise()
      drawNoise(glitching ? 1.7 : 1)
      drawChromaSmear(time)
      if (glitching) {
        ctx.save()
        ctx.fillStyle = '#fff'
        ctx.globalAlpha = 0.16
        ctx.fillRect(0, glitchY, viewportWidth, 2)
        ctx.globalAlpha = 0.08
        ctx.fillRect(0, glitchY + 3, viewportWidth, 9)
        ctx.restore()
      } else if (now >= nextGlitchAt) {
        glitchUntil = now + GLITCH_DURATION_MS
        glitchY = Math.random() * viewportHeight
        nextGlitchAt = now + GLITCH_MIN_GAP_MS + Math.random() * (GLITCH_MAX_GAP_MS - GLITCH_MIN_GAP_MS)
      }
      for (let i = 0; i < dust.length; i += 1) {
        const particle = dust[i]
        const dx = particle.x - mouse.smoothX
        const dy = particle.y - mouse.smoothY
        const distanceSq = dx * dx + dy * dy
        if (distanceSq < MOUSE_RADIUS_PX * MOUSE_RADIUS_PX) {
          const distance = Math.sqrt(distanceSq) || 1
          const falloff = 1 - distance / MOUSE_RADIUS_PX
          const push = PUSH_FORCE * falloff * falloff * deltaSeconds
          particle.vx += (dx / distance) * push
          particle.vy += (dy / distance) * push
        }
        particle.vx += (particle.homeX - particle.x) * SPRING_STIFFNESS * deltaSeconds
        particle.vy += (particle.homeY - particle.y) * SPRING_STIFFNESS * deltaSeconds
        particle.vx *= damping
        particle.vy *= damping
        particle.x += particle.vx * deltaSeconds
        particle.y += particle.vy * deltaSeconds
        ctx.globalAlpha = particle.alpha * (0.8 + 0.2 * Math.sin(time * 2.5 + particle.phase))
        ctx.fillStyle = particle.tint
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
      }
      ctx.globalAlpha = 1
    }
    animationFrame = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="analog-grain" aria-hidden="true" />
}

import * as THREE from 'three'

// Why a helper: both PlanetHotspot halos and planet glow particles need the
// same soft radial sprite. Drawing it once in code avoids shipping an image
// asset and guarantees identical falloff everywhere it is used.

/**
 * Build a 64px white radial-gradient sprite texture.
 * Centre is opaque, edge fades to transparent — ideal for additive glows.
 */
export function createGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

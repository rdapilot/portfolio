// Capability probe, evaluated once at module load (never in render, so the
// render stays pure). A null context means software-blocked or absent WebGL —
// App renders a message instead of mounting a Canvas that would throw.

// Baked at import time: capability doesn't change without a reload.
export const WEBGL_AVAILABLE = (() => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
})()

// Small math helpers shared by the scroll-driven 3D scene.
// Why a module: smooth01 is used by SectorTitle, SceneRig, and hotspots.
// One definition keeps the easing curve identical everywhere.

/**
 * Smoothstep clamp: maps any number to a 0..1 eased blend.
 * Used for scroll ranges, fades, and fly-out interpolation so motion
 * eases in/out instead of snapping at range edges.
 */
export function smooth01(value) {
  const clamped = Math.min(1, Math.max(0, value))
  return clamped * clamped * (3 - 2 * clamped)
}

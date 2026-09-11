import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Central scene configuration.
// Why one file: the original App.jsx scattered magic numbers across 1266
// lines. A reader had to hunt for "what are the card textures?" or "where do
// hotspots sit?". Grouping them here (one concern per section) means the 3D
// components import intent-revealing names instead of re-declaring literals.
// ---------------------------------------------------------------------------

// --- 2D starfield overlay (DOM, not WebGL) ----------------------------------
export const STAR_COUNT = 150

// --- Planet trio -------------------------------------------------------------
// Three hand-placed planet centres forming a small triangle around the origin.
export const PLANET_POSITIONS = [
  [1.5, 0, 0],
  [-0.75, 0, 1.299],
  [-0.75, 0, -1.299],
]

export const PLANET_COLORS = ['#c96f4a', '#7fb069', '#5b8e7d']

// Per-planet accent themes reused by hotspot bubbles + the focus modal so the
// 2D UI always matches the 3D planet the card belongs to.
export const PLANET_ACCENTS = [
  { accent: '#e89a6b', deep: '#7c3f22', ink: '#1a0e08' },
  { accent: '#a3d97b', deep: '#3d6030', ink: '#0e1408' },
  { accent: '#7fd4c1', deep: '#2a5a50', ink: '#07120f' },
]

// Random glow-particle directions baked once at startup. Module-level (not in
// a component) so hot reloads / re-renders never reshuffle the particles.
export const PLANET_GLOWS = PLANET_POSITIONS.map(() => {
  const positions = new Float32Array(9)
  for (let glowIndex = 0; glowIndex < 3; glowIndex += 1) {
    const direction = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    )
    if (direction.lengthSq() < 1e-4) direction.set(0, 1, 0)
    direction.normalize().multiplyScalar(1.02)
    positions[glowIndex * 3] = direction.x
    positions[glowIndex * 3 + 1] = direction.y
    positions[glowIndex * 3 + 2] = direction.z
  }
  return positions
})

// --- Card carousel ------------------------------------------------------------
export const CARD_COUNT = 9
export const CARD_RADIUS = 1.8

export const CARD_TEXTURE_URLS = [
  '/assets/_ (21).jpeg',
  '/assets/_ (22).jpeg',
  '/assets/_ (23).jpeg',
  '/assets/_ (24).jpeg',
  '/assets/_ (25).jpeg',
  '/assets/_ (26).jpeg',
  '/assets/_ (27).jpeg',
  '/assets/_ (28).jpeg',
  '/assets/Use this card when nothing makes sense.jpeg',
].map(encodeURI)

// Card metadata shown in hover dialogue bubbles + the spotlight caption.
export const CARD_DETAILS = [
  { title: 'Ember Drift', tag: 'CARD 01 — FIRE', blurb: 'A slow-burning fragment from the outer belt. Warm, restless, always moving.' },
  { title: 'Verdant Echo', tag: 'CARD 02 — BLOOM', blurb: 'A greenhouse signal. Soft greens that remember every spring at once.' },
  { title: 'Tide Ledger', tag: 'CARD 03 — WATER', blurb: 'Keeps count of every wave. Cool, patient, quietly systematic.' },
  { title: 'Solar Static', tag: 'CARD 04 — SPARK', blurb: 'Sunlight caught mid-flicker. Loud at first, gentle once you listen.' },
  { title: 'Moss Circuit', tag: 'CARD 05 — GROWTH', blurb: 'Nature wired into the machine. Half garden, half motherboard.' },
  { title: 'Glass Meridian', tag: 'CARD 06 — LINE', blurb: 'The thin line where day splits. Precise, reflective, calm.' },
  { title: 'Night Apiary', tag: 'CARD 07 — HIVE', blurb: 'Bees dream here after dark. A low hum of ordered chaos.' },
  { title: 'Paper Comet', tag: 'CARD 08 — DRIFT', blurb: 'Folds itself into speed. Fragile on the ground, fearless in air.' },
  { title: 'Wildcard Sense', tag: 'CARD 09 — WILD', blurb: 'Play this when nothing makes sense. It resolves everything sideways.' },
]

// --- Planet hotspots -----------------------------------------------------------
// Three hotspots per sphere -> 9 total, mapped 1:1 onto the 9 carousel cards.
// Directions are unit-ish offsets from each planet centre (planet mesh radius
// ~0.6). They are normalized once below so every hotspot sits at a uniform
// distance above the surface.
const HOTSPOT_DIRECTIONS = [
  [[0.7, 0.55, 0.4], [-0.6, 0.5, 0.55], [0.1, -0.7, 0.6]],
  [[0.65, 0.4, -0.5], [-0.55, 0.65, -0.4], [0.0, -0.6, -0.65]],
  [[0.75, 0.35, 0.35], [-0.7, 0.3, 0.45], [0.05, 0.8, -0.3]],
]

// Planet mesh radius (icosahedron r=1 scaled 0.6) + hover lift above surface.
export const PLANET_SURFACE_RADIUS = 0.6
export const HOTSPOT_LIFT = 0.12

export const HOTSPOT_OFFSETS = HOTSPOT_DIRECTIONS.map((directions) =>
  directions.map(([x, y, z]) => {
    const length = Math.hypot(x, y, z) || 1
    const orbitRadius = PLANET_SURFACE_RADIUS + HOTSPOT_LIFT
    return [(x / length) * orbitRadius, (y / length) * orbitRadius, (z / length) * orbitRadius]
  }),
)

// --- Scroll-driven spotlight ----------------------------------------------------
// Scroll offsets at which a carousel card flies out to meet the camera.
export const SPOTLIGHT_START = 0.5
export const SPOTLIGHT_END = 0.76

// --- Glitch title -----------------------------------------------------------------
export const TITLE_TARGET = 'SECTOR-G48'
export const SCRAMBLE_POOL = 'ABCDEFXYZ0123456789<>/\\|#*+?@$%&'

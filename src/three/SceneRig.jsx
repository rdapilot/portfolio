import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Environment, useScroll } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import SectorTitle from './SectorTitle.jsx'
import PlanetSystem from './PlanetSystem.jsx'
import CardCarousel from './CardCarousel.jsx'
import GardenFinale, { CHIP_BASE_Y } from './GardenFinale.jsx'
import CloudLayer from './CloudLayer.jsx'
import { CARD_COUNT, CARD_RADIUS, CARD_TEXTURE_URLS, SPOTLIGHT_END, SPOTLIGHT_START } from '../config/sceneConfig.js'
import { smooth01 } from '../utils/math.js'
import { createGlowTexture } from '../utils/glowTexture.js'

// ---------------------------------------------------------------------------
// SceneRig: the scroll-driven choreographer. It owns every mutable ref and
// runs one useFrame that, in order: (1) scrubs the GSAP entrance/exit
// timeline, (2) flies the camera along its path, (3) rotates/fades planets +
// carousel, (4) flies the spotlight card out + flutters paper, (5) fades the
// transition clouds + sky color, (6) spins the garden finale.
// JSX stays thin by delegating each set to PlanetSystem / CardCarousel /
// GardenFinale / CloudLayer; this file keeps only motion + camera logic.
// ---------------------------------------------------------------------------

// Puff offsets (x, y, z, radius) forming one soft cloud cluster.
const CLOUD_PUFFS = [
  [0, 0, 0, 0.32],
  [0.3, 0.06, 0.05, 0.24],
  [-0.3, 0.04, -0.04, 0.22],
  [0.08, 0.18, -0.02, 0.2],
]

export default function SceneRig({ onSelect, isNegative }) {
  const scroll = useScroll()

  // --- Set refs (owned here, rendered by child set components) --------------
  const planetsRef = useRef(null)
  const cardsRef = useRef(null)
  const cardMeshes = useRef([])
  const cardGroups = useRef([])
  const cardFlap = useRef([])
  const glowMatRefs = useRef([])
  const lightRef = useRef(null)
  const timelineRef = useRef(null)
  const hotspotDim = useRef(1)
  const hotspotsRef = useRef(null)
  const hoverPause = useRef({ count: 0, epoch: 0 })
  const gardenRef = useRef(null)
  const chipRef = useRef(null)
  const cloudsRef = useRef(null)

  // Scratch objects reused every frame — never allocate inside useFrame.
  const spot = useMemo(
    () => ({
      hold: new THREE.Vector3(0, 0.1, 2.2),
      v1: new THREE.Vector3(),
      v2: new THREE.Vector3(),
      qBase: new THREE.Quaternion(),
      qWorld: new THREE.Quaternion(),
      qParentInv: new THREE.Quaternion(),
      m: new THREE.Matrix4(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    [],
  )
  const waypoints = useMemo(
    () => ({
      orbitTop: new THREE.Vector3(0, 6, 0.01),
      carouselFront: new THREE.Vector3(0, 0.15, 4.8),
      gardenAbove: new THREE.Vector3(0, -7.0, 6.8),
      gardenLook: new THREE.Vector3(0, -8.9, 0),
      origin: new THREE.Vector3(0, 0, 0),
      look: new THREE.Vector3(0, 0, 0),
      tmp: new THREE.Vector3(),
    }),
    [],
  )
  const easeInOut = useMemo(() => gsap.parseEase('power2.inOut'), [])
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const cloudMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  )
  const clouds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2 + 0.4
        const radius = 3.4 + (i % 3) * 0.9
        return {
          pos: [Math.cos(angle) * radius, 0.4 + (i % 4) * 0.55, Math.sin(angle) * radius],
          s: 0.7 + (i % 3) * 0.3,
        }
      }),
    [],
  )
  const glowTexture = useMemo(() => createGlowTexture(), [])
  // Negative-mode background inversion. The canvas itself is never CSS-
  // filtered (that would take the exempt planets/cards/chip with it), so the
  // 3D backgrounds invert here instead: sky clear-color and cloud tint swap
  // to complements. Object materials are never touched — exempt by design.
  const negativeRef = useRef(isNegative)
  useEffect(() => {
    negativeRef.current = isNegative
    cloudMaterial.color.set(isNegative ? '#0a0a0a' : '#ffffff')
  }, [isNegative, cloudMaterial])
  // Responsive fit: on narrow (portrait/phone) viewports the whole set scales
  // down so the planet trio, card ring, and title stay in frame. Exactly 1 on
  // landscape/desktop, so the desktop look is untouched. Re-renders on resize
  // via the useThree subscription.
  const viewportSize = useThree((s) => s.size)
  const viewportAspect = viewportSize.width / Math.max(1, viewportSize.height)
  const sceneFit = viewportAspect >= 1 ? 1 : THREE.MathUtils.clamp(viewportAspect / 1.1, 0.62, 1)
  const textures = useLoader(THREE.TextureLoader, CARD_TEXTURE_URLS)
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    texture.needsUpdate = true
  })

  // --- GSAP scrubbed timeline: progress driven by drei scroll offset --------
  // Positions are authored in unscaled world units then counter-scaled: the
  // parent fit-group multiplies every child position by sceneFit, so feeding
  // GSAP pre-divided values keeps world-space choreography identical on all
  // screens. (Scales and rotations are unitless — untouched.) Rebuilds when
  // the fit changes (rotation/resize); progress re-applies next frame.
  useLayoutEffect(() => {
    const positionScale = 1 / sceneFit
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
      if (planetsRef.current) {
        tl.to(planetsRef.current.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.57 }, 0.26)
        tl.to(planetsRef.current.position, { y: 2.2 * positionScale, duration: 0.57 }, 0.26)
      }
      if (cardsRef.current) {
        tl.fromTo(cardsRef.current.position, { y: -5 * positionScale }, { y: 0, duration: 0.62 }, 0.62)
        tl.to(cardsRef.current.position, { y: -6 * positionScale, duration: 0.35 }, 1.95)
      }
      const scales = (cardMeshes.current || []).filter(Boolean).map((mesh) => mesh.scale)
      if (scales.length > 0) {
        tl.fromTo(
          scales,
          { x: 0.001, y: 0.001, z: 0.001 },
          { x: 1, y: 1, z: 1, duration: 0.5, stagger: 0.035 },
          0.75,
        )
      }
      if (gardenRef.current) {
        tl.fromTo(gardenRef.current.position, { y: -14 * positionScale }, { y: -9 * positionScale, duration: 0.4 }, 1.95)
      }
      // Tail padding so the last page holds still instead of ending mid-tween.
      const pad = { t: 0 }
      tl.to(pad, { t: 1, duration: 0.3, ease: 'none' }, 2.3)
      timelineRef.current = tl
    })
    return () => {
      ctx.revert()
      timelineRef.current = null
    }
  }, [sceneFit])

  // --- Per-frame helpers (each does one job; useFrame calls them in order) --
  const updateCamera = (state, scrollOffset, carouselToGarden, gardenBlend) => {
    if (scrollOffset < 0.2) {
      // Opening orbit: spiral down around the planets.
      const orbitProgress = scroll.range(0, 0.2)
      const angle = Math.PI / 2 + orbitProgress * Math.PI * 1.5
      const radius = 5.2 * (1 - smooth01((orbitProgress - 0.8) / 0.2))
      const height = 1.2 + orbitProgress * 4.8
      state.camera.position.set(radius * Math.cos(angle), height, radius * Math.sin(angle))
      waypoints.look.copy(waypoints.origin)
    } else if (scrollOffset < 0.34) {
      state.camera.position.copy(waypoints.orbitTop)
      waypoints.look.copy(waypoints.origin)
    } else if (scrollOffset < 0.78) {
      // Dive from the orbit top to the carousel: a straight lerp reads as a
      // mechanical elevator ride, so add a whisper of sideways drift (peak
      // biased toward the start for an ease-out feel). Kept to ~3% of travel
      // and scaled by the responsive fit — anything bigger visibly swings the
      // view off the set instead of softening the ride.
      waypoints.tmp.lerpVectors(waypoints.orbitTop, waypoints.carouselFront, carouselToGarden)
      const diveBow = Math.sin(Math.PI * Math.pow(carouselToGarden, 0.85)) * sceneFit
      state.camera.position.copy(waypoints.tmp)
      state.camera.position.x += diveBow * 0.22
      state.camera.position.y += diveBow * 0.12
      waypoints.look.copy(waypoints.origin)
    } else {
      // Ride to the garden with the same treatment: a faint bow + lift so the
      // camera settles in on a curve instead of sliding down a rail.
      waypoints.tmp.lerpVectors(waypoints.carouselFront, waypoints.gardenAbove, gardenBlend)
      const rideBow = Math.sin(Math.PI * Math.pow(gardenBlend, 0.85)) * sceneFit
      state.camera.position.copy(waypoints.tmp)
      state.camera.position.x += rideBow * 0.28
      state.camera.position.y += rideBow * 0.15
      waypoints.look.lerpVectors(waypoints.origin, waypoints.gardenLook, gardenBlend)
    }
    state.camera.lookAt(waypoints.look)
  }

  const updatePlanets = (state, paused, carouselProgress, clampedDelta) => {
    if (!planetsRef.current) return
    if (!paused && !prefersReducedMotion) planetsRef.current.rotation.y += clampedDelta * 0.35 * (1 - carouselProgress)
    planetsRef.current.visible = planetsRef.current.scale.x > 0.02
    // Dim hotspots as planets shrink so bubbles never float over empty space.
    hotspotDim.current = smooth01((planetsRef.current.scale.x - 0.1) / 0.4)
    const hotspotsVisible = planetsRef.current.scale.x > 0.15
    if (hotspotsRef.current) hotspotsRef.current.visible = hotspotsVisible
    if (!hotspotsVisible && hoverPause.current.count > 0) {
      hoverPause.current.count = 0
      hoverPause.current.epoch += 1
    }
    glowMatRefs.current.forEach((material, i) => {
      if (material) {
        const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.5 + i * 2.1)
        material.opacity = 0.28 + 0.22 * pulse
        material.size = 0.06 + 0.03 * pulse
      }
    })
  }

  const updateSpotlightCards = (state, scrollOffset, paused, clampedDelta) => {
    if (!cardsRef.current) return
    // Thresholds are world-authored; the ring position is parent-scaled, so
    // compare in counter-scaled units (identity on desktop).
    const positionScale = 1 / sceneFit
    const spotGlobal = smooth01((scrollOffset - (SPOTLIGHT_START - 0.05)) / 0.08)
    if (!paused && !prefersReducedMotion) cardsRef.current.rotation.y += clampedDelta * (0.22 - spotGlobal * 0.14)
    cardsRef.current.visible =
      (cardsRef.current.position.y > -4.9 * positionScale || scrollOffset > 0.72) &&
      !(scrollOffset > 0.84 && cardsRef.current.position.y <= -5.5 * positionScale)

    // Spotlight fly-out: each card takes a 1/CARD_COUNT slice of the scroll
    // range, eases toward the camera hold point, then flutters like paper.
    const ring = cardsRef.current
    const totalProgress = Math.min(1, Math.max(0, (scrollOffset - SPOTLIGHT_START) / (SPOTLIGHT_END - SPOTLIGHT_START)))
    ring.updateWorldMatrix(true, false)
    ring.getWorldQuaternion(spot.qParentInv)
    spot.qParentInv.invert()
    const cameraPosition = state.camera.position
    const distance = cameraPosition.distanceTo(spot.hold)
    const viewHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(state.camera.fov * 0.5))
    const viewWidth = viewHeight * (state.size.width / Math.max(1, state.size.height))
    const fitScale = Math.min((0.94 * viewHeight) / 1.5, (0.94 * viewWidth) / 1.0, 2.2)
    for (let i = 0; i < CARD_COUNT; i += 1) {
      const group = cardGroups.current[i]
      const mesh = cardMeshes.current[i]
      if (!group || !mesh) continue
      const angle = (i / CARD_COUNT) * Math.PI * 2
      const baseX = Math.cos(angle) * CARD_RADIUS
      const baseZ = Math.sin(angle) * CARD_RADIUS
      const local = Math.min(1, Math.max(0, totalProgress * CARD_COUNT - i))
      const fly = smooth01(local / 0.3) * (1 - smooth01((local - 0.7) / 0.3))
      const eased = fly * fly * (3 - 2 * fly)
      const timelineScale = mesh.scale.x
      if (eased < 0.0001) {
        group.position.set(baseX, 0, baseZ)
        group.rotation.set(0, -angle, 0)
      } else {
        spot.v1.copy(spot.hold)
        ring.worldToLocal(spot.v1)
        // Arc the flight: lift + a consistent counter-clockwise tangential bow
        // (same swirl direction for every card reads as choreography; mixed
        // directions would read as chaos). ~15% of travel, zero at endpoints.
        const flightBow = Math.sin(Math.PI * eased)
        const tangentX = -Math.sin(angle)
        const tangentZ = Math.cos(angle)
        group.position.set(
          baseX + (spot.v1.x - baseX) * eased + tangentX * flightBow * 0.3,
          spot.v1.y * eased + flightBow * 0.45,
          baseZ + (spot.v1.z - baseZ) * eased + tangentZ * flightBow * 0.3,
        )
        group.getWorldPosition(spot.v2)
        spot.m.lookAt(cameraPosition, spot.v2, spot.up)
        spot.qWorld.setFromRotationMatrix(spot.m)
        spot.qWorld.premultiply(spot.qParentInv)
        spot.qBase.setFromAxisAngle(spot.up, -angle)
        spot.qBase.slerp(spot.qWorld, eased)
        group.quaternion.copy(spot.qBase)
      }
      mesh.scale.setScalar(Math.max(0.001, timelineScale + (fitScale - timelineScale) * eased))
      mesh.renderOrder = eased > 0.02 ? 10 + i : 0
      applyPaperFlutter(group, mesh, i, eased, clampedDelta, state.clock.elapsedTime)
    }
  }

  // Paper flutter: velocity-lean + travelling camber wave written directly
  // into the plane vertices. Skipped (frozen) for reduced motion.
  const applyPaperFlutter = (group, mesh, index, eased, clampedDelta, time) => {
    const flap = cardFlap.current[index] || (cardFlap.current[index] = { phase: Math.random() * Math.PI * 2, prevE: 0, lean: 0 })
    if (!mesh.userData.base) mesh.userData.base = mesh.geometry.attributes.position.array.slice()
    const rawLean = prefersReducedMotion ? 0 : THREE.MathUtils.clamp((eased - flap.prevE) * 10, -0.5, 0.5)
    flap.prevE = eased
    flap.lean += (rawLean - flap.lean) * Math.min(1, clampedDelta * 8)
    const air = prefersReducedMotion ? 0 : Math.min(1, Math.abs(flap.lean) * 3.5)
    const skew = THREE.MathUtils.clamp(flap.lean * 8, -1, 1)
    group.rotateX(flap.lean * 0.9 + Math.sin(time * 9 + flap.phase) * 0.06 * air)
    group.rotateZ(Math.cos(time * 7.7 + flap.phase * 1.3) * 0.08 * air)
    if (air >= 0.02 || Math.abs(flap.lean) >= 0.01) {
      const posAttr = mesh.geometry.attributes.position
      const base = mesh.userData.base
      const waveSpeed = 6 + 10 * air
      for (let v = 0; v < posAttr.count; v += 1) {
        const nx = base[v * 3] / 0.5
        const ny = base[v * 3 + 1] / 0.75
        const weight = 0.5 + 0.5 * nx * skew
        const camber = -skew * 0.25 * air * air * weight * weight
        const flutter = (0.012 + 0.055 * air) * weight * Math.sin(weight * 5.5 - time * waveSpeed) * (0.7 + 0.3 * ny * ny)
        const idle = 0.008 * Math.sin(time * 2 + flap.phase + nx * 1.5) * (0.5 + 0.5 * ny * ny)
        posAttr.array[v * 3 + 2] = camber + flutter + idle
      }
      posAttr.needsUpdate = true
      mesh.geometry.computeVertexNormals()
    }
  }

  const updateAtmosphere = (state, carouselToGarden, gardenBlend, clampedDelta) => {
    if (lightRef.current) lightRef.current.intensity = carouselToGarden * 12 * (1 - gardenBlend)
    if (cloudsRef.current) {
      cloudsRef.current.visible = carouselToGarden > 0.02 && gardenBlend < 0.98
      if (!prefersReducedMotion) cloudsRef.current.rotation.y += clampedDelta * 0.02
    }
    // eslint-disable-next-line react-hooks/immutability -- Per-frame Three.js material write; the idiomatic R3F equivalent of a uniform update.
    cloudMaterial.opacity = carouselToGarden * 0.92 * (1 - gardenBlend)
    // Sky complement of #87ceeb — the 3D background follows negative mode.
    state.gl.setClearColor(negativeRef.current ? '#783114' : '#87ceeb', carouselToGarden * (1 - gardenBlend))
  }

  const updateGarden = (state, paused, clampedDelta) => {
    if (!gardenRef.current) return
    // Same counter-scaling: threshold is world-authored, position is local.
    gardenRef.current.visible = gardenRef.current.position.y > (-13.5 / sceneFit)
    if (!gardenRef.current.visible) return
    // Slow turntable + gentle hover for the chip; frozen on hover-pause so
    // inspecting a hotspot never fights the motion. Bob is counter-scaled so
    // the chip holds the same world height on every screen size.
    if (!paused && !prefersReducedMotion && chipRef.current) {
      chipRef.current.rotation.y += clampedDelta * 0.3
    }
    if (chipRef.current && !prefersReducedMotion) {
      chipRef.current.position.y =
        (CHIP_BASE_Y + Math.sin(state.clock.elapsedTime * 1.1) * 0.15) / sceneFit
    }
  }

  // eslint-disable-next-line react-hooks/immutability -- Frame loop performs the idiomatic per-frame Three.js writes above; no React state is mutated.
  useFrame((state, delta) => {
    const scrollOffset = scroll.offset
    const clampedDelta = Math.min(delta, 0.05)
    if (timelineRef.current) timelineRef.current.progress(scrollOffset)

    // Portrait rescue: widen the lens slightly on narrow screens so horizontal
    // framing survives. Capped low (the scene-fit scale already does most of
    // the work — lens + scale double-compensating reads as loose framing);
    // desktop stays at 50.
    const frameAspect = state.size.width / Math.max(1, state.size.height)
    const targetFov = frameAspect < 1 ? Math.min(56, 50 / Math.sqrt(frameAspect)) : 50
    if (Math.abs(state.camera.fov - targetFov) > 0.1) {
      state.camera.fov = targetFov
      state.camera.updateProjectionMatrix()
    }

    const carouselProgress = scroll.range(0.2, 0.16)
    const carouselToGarden = easeInOut(Math.min(1, Math.max(0, (scrollOffset - 0.34) / 0.2)))
    const gardenBlend = easeInOut(Math.min(1, Math.max(0, (scrollOffset - 0.78) / 0.14)))

    // Seamless handoff veil: DOM overlay opacity driven from the 3D loop.
    const veilIn = smooth01((scrollOffset - 0.26) / 0.06) * (1 - smooth01((scrollOffset - 0.4) / 0.1))
    const veilOut = smooth01((scrollOffset - 0.74) / 0.05) * (1 - smooth01((scrollOffset - 0.86) / 0.08))
    const veil = typeof document !== 'undefined' ? document.getElementById('handoff-veil') : null
    if (veil) veil.style.opacity = String(Math.max(veilIn, veilOut) * 0.9)

    const paused = hoverPause.current.count > 0
    updateCamera(state, scrollOffset, carouselToGarden, gardenBlend)
    updatePlanets(state, paused, carouselProgress, clampedDelta)
    updateSpotlightCards(state, scrollOffset, paused, clampedDelta)
    updateAtmosphere(state, carouselToGarden, gardenBlend, clampedDelta)
    updateGarden(state, paused, clampedDelta)
  })

  return (
    <>
      {/* Self-hosted HDR (public/hdr): byte-identical to the old `city`
         preset, but served locally — no runtime CDN dependency. */}
      <Environment files="hdr/potsdamer_platz_1k.hdr" />
      {/* Responsive shell: uniform scale keeps the composition identical,
         only smaller, on phones. Environment stays outside (light only). */}
      <group scale={sceneFit}>
        <SectorTitle />
        <PlanetSystem
          groupRef={planetsRef}
          hotspotsRef={hotspotsRef}
          glowMaterialRefs={glowMatRefs}
          glowTexture={glowTexture}
          hotspotDimRef={hotspotDim}
          hoverPauseRef={hoverPause}
          onSelectCard={onSelect}
        />
        <CardCarousel
          groupRef={cardsRef}
          cardMeshesRef={cardMeshes}
          cardGroupsRef={cardGroups}
          textures={textures}
          lightRef={lightRef}
        />
      <GardenFinale
        groupRef={gardenRef}
        chipRef={chipRef}
      />
        <CloudLayer groupRef={cloudsRef} clouds={clouds} cloudMaterial={cloudMaterial} puffShapes={CLOUD_PUFFS} />
      </group>
    </>
  )
}

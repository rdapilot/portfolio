import { useEffect, useRef, useState } from 'react'
import { Center, Sparkles, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { SCRAMBLE_POOL, TITLE_TARGET } from '../config/sceneConfig.js'
import { smooth01 } from '../utils/math.js'

// Glitching 3D title floating above the planets.
// Two loops: a DOM-timer scramble loop (resolves the title letter by letter,
// then rests 2.6–5.2s) and a per-frame loop for float, fade-out on scroll,
// and RGB-split glitch bursts. Ghost copies offset in red/cyan only show
// during bursts.
export default function SectorTitle() {
  const scroll = useScroll()
  const [display, setDisplay] = useState(TITLE_TARGET)
  const outerRef = useRef(null)
  const jitterRef = useRef(null)
  const mainMaterialRef = useRef(null)
  const ghostMaterials = useRef([])
  const glitchBurst = useRef({ next: 2, until: 0 })

  // Scramble loop: reveal one more true letter every 66ms over 900ms.
  useEffect(() => {
    let animationFrame = 0
    let timeout = 0
    const runScramble = () => {
      const start = performance.now()
      const duration = 900
      let lastUpdate = 0
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration)
        if (now - lastUpdate >= 66 || progress >= 1) {
          lastUpdate = now
          const resolvedCount = Math.floor(progress * TITLE_TARGET.length)
          let out = ''
          for (let i = 0; i < TITLE_TARGET.length; i += 1) {
            const char = TITLE_TARGET[i]
            out += i < resolvedCount || char === '-' ? char : SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)]
          }
          setDisplay(out)
        }
        if (progress < 1) animationFrame = requestAnimationFrame(tick)
        else timeout = setTimeout(runScramble, 2600 + Math.random() * 2600)
      }
      animationFrame = requestAnimationFrame(tick)
    }
    timeout = setTimeout(runScramble, 1200)
    return () => {
      cancelAnimationFrame(animationFrame)
      clearTimeout(timeout)
    }
  }, [])

  useFrame((state, delta) => {
    const scrollOffset = scroll.offset
    const time = state.clock.elapsedTime
    const clampedDelta = Math.min(delta, 0.05)
    // Fade the whole title out across scroll 0.08 → 0.30.
    const fade = 1 - smooth01((scrollOffset - 0.08) / 0.22)
    if (outerRef.current) {
      outerRef.current.visible = fade > 0.02
      outerRef.current.position.y = 0.95 + Math.sin(time * 0.8) * 0.05
    }
    if (glitchBurst.current.next < time) {
      glitchBurst.current.until = time + 0.1 + Math.random() * 0.25
      glitchBurst.current.next = glitchBurst.current.until + 1.5 + Math.random() * 4
    }
    const glitching = time < glitchBurst.current.until
    if (jitterRef.current) {
      const decay = Math.exp(-8 * clampedDelta)
      jitterRef.current.position.x = glitching
        ? (Math.random() - 0.5) * 0.14
        : jitterRef.current.position.x * decay
      jitterRef.current.position.y = glitching
        ? (Math.random() - 0.5) * 0.05
        : jitterRef.current.position.y * decay
      jitterRef.current.rotation.z = glitching ? (Math.random() - 0.5) * 0.02 : 0
    }
    if (mainMaterialRef.current) {
      mainMaterialRef.current.opacity = 0.55 * fade
      mainMaterialRef.current.emissiveIntensity = glitching ? 2.4 + Math.random() * 4 : 2.4
    }
    ghostMaterials.current.forEach((material) => {
      if (material) material.opacity = (glitching ? 0.45 + Math.random() * 0.3 : 0) * fade
    })
  })

  const renderGhostCopy = (color, xOffset, slot) => (
    <Text3D
      key={slot}
      font="fonts/helvetiker_bold.typeface.json"
      size={0.42}
      height={0.1}
      curveSegments={6}
      bevelEnabled={false}
      position={[xOffset, 0, -0.01]}
    >
      {display}
      <meshBasicMaterial
        ref={(material) => {
          ghostMaterials.current[slot] = material
        }}
        color={color}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </Text3D>
  )

  return (
    <group ref={outerRef} position={[0, 0.95, 0]}>
      <group ref={jitterRef}>
        <Center>
          <group>
            <Text3D
              font="fonts/helvetiker_bold.typeface.json"
              size={0.42}
              height={0.14}
              curveSegments={8}
              bevelEnabled
              bevelThickness={0.012}
              bevelSize={0.008}
              bevelSegments={3}
            >
              {display}
              <meshPhysicalMaterial
                ref={mainMaterialRef}
                color="#d8b4fe"
                emissive="#a855f7"
                emissiveIntensity={2.4}
                roughness={0.12}
                metalness={0}
                clearcoat={1}
                clearcoatRoughness={0.1}
                transparent
                opacity={0.55}
                depthWrite={false}
                toneMapped={false}
              />
            </Text3D>
            {renderGhostCopy('#ff2d78', -0.035, 0)}
            {renderGhostCopy('#22d3ee', 0.035, 1)}
          </group>
        </Center>
      </group>
      <Sparkles count={45} scale={[6, 1.6, 2]} size={3} speed={0.3} color="#c084fc" opacity={0.7} />
      <pointLight position={[0, 0, 1.5]} color="#a855f7" intensity={6} distance={9} decay={2} />
    </group>
  )
}

import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CARD_COUNT, CARD_DETAILS, CARD_TEXTURE_URLS, PLANET_COLORS } from '../config/sceneConfig.js'

// One glowing hotspot floating above a planet surface.
// Hovering shows a dialogue bubble (drei Html) with that card's metadata and
// pauses the planet + carousel rotation via the shared hoverPause ref —
// hoverPause.count tracks nested hovers, .epoch invalidates stale hovers when
// the planets scroll out of view and SceneRig resets the counter.
export default function PlanetHotspot({ position, cardIndex, glowTexture, dimRef, pauseRef, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)
  const coreRef = useRef(null)
  const haloRef = useRef(null)
  const hoverActive = useRef(false)
  const hoverEpoch = useRef(0)
  const detail = CARD_DETAILS[cardIndex % CARD_DETAILS.length]
  const planetColor = PLANET_COLORS[Math.floor(cardIndex / 3) % PLANET_COLORS.length]

  useFrame((state) => {
    // Another hotspot (or the scroll rig) invalidated our hover epoch.
    if (isHovered && hoverEpoch.current !== pauseRef.current.epoch) {
      hoverActive.current = false
      setIsHovered(false)
    }
    const time = state.clock.elapsedTime
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.2 + cardIndex * 1.7)
    const dim = dimRef?.current ?? 1
    const baseScale = (isHovered ? 1.7 : 1) * dim
    if (coreRef.current) coreRef.current.scale.setScalar(baseScale * (1 + pulse * 0.12))
    if (haloRef.current) {
      haloRef.current.scale.setScalar(baseScale * (1.3 + pulse * 0.3))
      haloRef.current.material.opacity = (isHovered ? 0.6 : 0.25 + pulse * 0.12) * dim
    }
  })

  const beginHover = (event) => {
    event.stopPropagation()
    if (!hoverActive.current) {
      hoverActive.current = true
      hoverEpoch.current = pauseRef.current.epoch
      pauseRef.current.count += 1
      setIsHovered(true)
    }
    document.body.style.cursor = 'pointer'
  }

  const endHover = () => {
    if (hoverActive.current) {
      hoverActive.current = false
      pauseRef.current.count = Math.max(0, pauseRef.current.count - 1)
      setIsHovered(false)
    }
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={position}>
      {/* Soft additive halo sprite */}
      <sprite ref={haloRef}>
        <spriteMaterial
          map={glowTexture}
          color={planetColor}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {/* Bright white core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {/* Generous invisible hit area for easy hovering */}
      <mesh onPointerOver={beginHover} onPointerOut={endHover}>
        <sphereGeometry args={[0.17, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {isHovered && (
        <Html position={[0, 0.34, 0]} center distanceFactor={9} occlude={false} wrapperClass="hotspot-html">
          <div
            className={`hotspot-bubble is-p${Math.floor(cardIndex / 3)}`}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(cardIndex)
            }}
          >
            <span className="hotspot-tail" />
            <img src={CARD_TEXTURE_URLS[cardIndex]} alt={detail.title} draggable={false} />
            <div className="hotspot-text">
              <span className="hotspot-tag">{detail.tag}</span>
              <strong className="hotspot-title">{detail.title}</strong>
              <p className="hotspot-blurb">{detail.blurb}</p>
              <span className="hotspot-hint">
                Scroll — it flies out {cardIndex + 1} / {CARD_COUNT}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

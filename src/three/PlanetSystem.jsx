import PlanetHotspot from './PlanetHotspot.jsx'
import * as THREE from 'three'
import {
  HOTSPOT_OFFSETS,
  PLANET_COLORS,
  PLANET_GLOWS,
  PLANET_POSITIONS,
} from '../config/sceneConfig.js'

// The opening trio: one solid, one wireframe, one particle planet, each with
// additive glow points + three hover hotspots (9 total -> 9 cards).
// Presentational only — SceneRig owns the group ref + scroll shrink via props.
export default function PlanetSystem({
  groupRef,
  hotspotsRef,
  glowMaterialRefs,
  glowTexture,
  hotspotDimRef,
  hoverPauseRef,
  onSelectCard,
}) {
  return (
    <group ref={groupRef}>
      {/* Solid rust planet */}
      <mesh scale={0.6} position={PLANET_POSITIONS[0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={PLANET_COLORS[0]}
          roughness={0.55}
          metalness={0.15}
          flatShading
          envMapIntensity={0.5}
        />
      </mesh>
      {/* Wireframe green planet */}
      <mesh scale={0.6} position={PLANET_POSITIONS[1]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={PLANET_COLORS[1]}
          roughness={0.55}
          metalness={0.15}
          flatShading
          wireframe
          envMapIntensity={0.5}
        />
      </mesh>
      {/* Particle teal planet */}
      <points scale={0.6} position={PLANET_POSITIONS[2]}>
        <icosahedronGeometry args={[1, 1]} />
        <pointsMaterial size={0.025} color={PLANET_COLORS[2]} sizeAttenuation transparent opacity={0.7} />
      </points>

      {/* Pulsing glow particles hugging each planet */}
      {PLANET_GLOWS.map((positions, planetIndex) => (
        <points key={`glow-${planetIndex}`} scale={0.6} position={PLANET_POSITIONS[planetIndex]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={(material) => {
              glowMaterialRefs.current[planetIndex] = material
            }}
            size={0.07}
            map={glowTexture}
            color={PLANET_COLORS[planetIndex]}
            sizeAttenuation
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}

      {/* Hover hotspots, hidden by SceneRig once planets shrink away */}
      <group ref={hotspotsRef}>
        {HOTSPOT_OFFSETS.map((offsets, planetIndex) =>
          offsets.map((offset, hotspotIndex) => {
            const cardIndex = planetIndex * 3 + hotspotIndex
            const base = PLANET_POSITIONS[planetIndex]
            return (
              <PlanetHotspot
                key={`hs-${planetIndex}-${hotspotIndex}`}
                cardIndex={cardIndex}
                glowTexture={glowTexture}
                dimRef={hotspotDimRef}
                pauseRef={hoverPauseRef}
                onSelect={onSelectCard}
                position={[base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]]}
              />
            )
          }),
        )}
      </group>
    </group>
  )
}

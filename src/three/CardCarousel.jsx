import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { CARD_COUNT, CARD_RADIUS } from '../config/sceneConfig.js'

// Nine textured cards on a ring. Presentational only: initial positions come
// from the angle; SceneRig drives the GSAP entrance + per-frame spotlight
// fly-out + paper flutter by mutating cardGroups / cardMeshes refs.
export default function CardCarousel({ groupRef, cardMeshesRef, cardGroupsRef, textures, lightRef }) {
  return (
    <group ref={groupRef} position={[0, -5, -1.0]}>
      {Array.from({ length: CARD_COUNT }, (_, index) => {
        const angle = (index / CARD_COUNT) * Math.PI * 2
        const position = [Math.cos(angle) * CARD_RADIUS, 0, Math.sin(angle) * CARD_RADIUS]
        return (
          <group
            key={index}
            position={position}
            rotation-y={-angle}
            ref={(group) => {
              cardGroupsRef.current[index] = group
            }}
          >
            <mesh
              ref={(mesh) => {
                cardMeshesRef.current[index] = mesh
              }}
            >
              <planeGeometry args={[1, 1.5, 6, 8]} />
              <meshStandardMaterial
                map={textures[index]}
                roughness={0.5}
                metalness={0.1}
                side={THREE.DoubleSide}
                envMapIntensity={0.6}
              />
            </mesh>
          </group>
        )
      })}
      <pointLight ref={lightRef} position={[0, 0.5, 0]} intensity={0} color="#ffffff" distance={8} decay={2} />
      <ContactShadows position={[0, -1.1, 0]} opacity={0.55} scale={12} blur={2.2} far={6} resolution={512} color="#0a0616" />
    </group>
  )
}

// Finale set: a single neon-green brain rising from below on the last page.
// Procedural (no model file): two overlapping hemispheres displaced by ridged
// sine noise — the |sin| folds read as gyri/sulci under flat shading — with
// the overlap seam forming the longitudinal fissure. SceneRig spins + bobs
// the inner group; the outer group ref still rides the GSAP entrance.
import { useMemo } from 'react'
import * as THREE from 'three'

const BRAIN_BASE_Y = 0.2
export { BRAIN_BASE_Y }

// Displace a sphere's vertices into brain-like folds. Ridged (|sin|) noise at
// two frequencies: broad gyri lumps + fine sulci wrinkles, stronger at the
// crown so the silhouette stays organic, not spiky.
function makeBrainHemisphere(side, seed) {
  const geometry = new THREE.SphereGeometry(0.95, 56, 40)
  const positions = geometry.attributes.position
  const vertex = new THREE.Vector3()
  for (let i = 0; i < positions.count; i += 1) {
    vertex.fromBufferAttribute(positions, i)
    const dir = vertex.clone().normalize()
    const broad =
      Math.abs(
        Math.sin(3.1 * dir.x + seed) * Math.sin(3.4 * dir.y + seed * 1.7) * Math.sin(3.2 * dir.z + seed * 0.6),
      ) - 0.45
    const fine =
      Math.abs(Math.sin(7.3 * dir.y + seed * 2.3) * Math.sin(6.8 * dir.x + seed * 0.9)) - 0.5
    const displacement = 1 + broad * 0.22 + fine * 0.07
    // Ellipsoid squash + hemisphere offset; inner faces sink into the fissure.
    vertex.set(
      dir.x * displacement * 0.82 + side * 0.42,
      dir.y * displacement * 0.72,
      dir.z * displacement * 1.05,
    )
    if (Math.abs(vertex.x - side * 0.42) < 0.12) vertex.x = side * 0.1
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

export default function GardenFinale({ groupRef, brainRef }) {
  // Built once: geometry is immutable after this, only transforms animate.
  const hemispheres = useMemo(
    () => [makeBrainHemisphere(-1, 1.7), makeBrainHemisphere(1, 4.2)],
    [],
  )

  return (
    <group ref={groupRef} position={[0, -14, 0]}>
      <group ref={brainRef} position={[0, BRAIN_BASE_Y, 0]}>
        {hemispheres.map((geometry, index) => (
          <mesh key={index} geometry={geometry}>
            <meshStandardMaterial
              color="#39ff6a"
              emissive="#1aff66"
              emissiveIntensity={0.85}
              roughness={0.38}
              metalness={0.1}
              flatShading
            />
          </mesh>
        ))}
        {/* Green spill so the brain glows against the dark finale. */}
        <pointLight position={[0, 0.6, 1.6]} intensity={6} color="#39ff6a" distance={9} decay={2} />
      </group>
    </group>
  )
}

// Finale set: a single PCB chip rising from below on the last page.
// Procedural (no model file): green soldermask board, gold traces, black die
// with a glowing core, pin rows, and capacitors — all primitives. SceneRig
// spins + bobs the inner group; the outer group ref rides the GSAP entrance.

const CHIP_BASE_Y = 0.4
export { CHIP_BASE_Y }

// Copper trace runs on the board surface (x, z, width, depth in board units).
const TRACES = [
  [-0.85, -0.55, 0.7, 0.035],
  [-0.85, -0.3, 0.45, 0.035],
  [-0.85, 0.05, 0.7, 0.035],
  [-0.85, 0.4, 0.45, 0.035],
  [-0.85, 0.7, 0.6, 0.035],
  [0.85, -0.55, 0.7, 0.035],
  [0.85, -0.2, 0.45, 0.035],
  [0.85, 0.15, 0.7, 0.035],
  [0.85, 0.5, 0.45, 0.035],
  [0.85, 0.72, 0.6, 0.035],
  [-0.3, -0.78, 0.035, 0.25],
  [0.35, -0.78, 0.035, 0.25],
  [-0.3, 0.78, 0.035, 0.25],
  [0.35, 0.78, 0.035, 0.25],
]

// Pin-1 vias: tiny gold pads scattered like real board stitching.
const VIAS = [
  [-1.1, -0.8],
  [1.1, -0.8],
  [-1.1, 0.8],
  [1.1, 0.8],
  [0, -0.85],
  [0, 0.85],
]

const PIN_COUNT_PER_SIDE = 8

export default function GardenFinale({ groupRef, chipRef }) {
  return (
    <group ref={groupRef} position={[0, -14, 0]}>
      <group ref={chipRef} position={[0, CHIP_BASE_Y, 0]}>
        {/* Soldermask board */}
        <mesh>
          <boxGeometry args={[2.6, 0.08, 1.9]} />
          <meshStandardMaterial color="#0d5c2e" roughness={0.55} metalness={0.25} />
        </mesh>

        {/* Gold traces */}
        {TRACES.map(([x, z, w, d], index) => (
          <mesh key={`trace-${index}`} position={[x, 0.045, z]}>
            <boxGeometry args={[w, 0.012, d]} />
            <meshStandardMaterial
              color="#d4a24e"
              emissive="#7a4d12"
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
        ))}

        {/* Stitching vias */}
        {VIAS.map(([x, z], index) => (
          <mesh key={`via-${index}`} position={[x, 0.045, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.014, 12]} />
            <meshStandardMaterial color="#d4a24e" roughness={0.3} metalness={0.85} />
          </mesh>
        ))}

        {/* Central die */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.9, 0.12, 0.9]} />
          <meshStandardMaterial color="#0a0a0c" roughness={0.35} metalness={0.4} />
        </mesh>
        {/* Glowing die core */}
        <mesh position={[0, 0.165, 0]}>
          <boxGeometry args={[0.62, 0.012, 0.62]} />
          <meshStandardMaterial color="#39ff6a" emissive="#1aff66" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        {/* Pin-1 marker dot */}
        <mesh position={[-0.32, 0.165, -0.32]}>
          <cylinderGeometry args={[0.035, 0.035, 0.014, 12]} />
          <meshStandardMaterial color="#d4a24e" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Pin rows along both long edges */}
        {[-1.38, 1.38].map((x) =>
          Array.from({ length: PIN_COUNT_PER_SIDE }, (_, i) => {
            const z = -0.77 + (i / (PIN_COUNT_PER_SIDE - 1)) * 1.54
            return (
              <mesh key={`pin-${x > 0 ? 'r' : 'l'}-${i}`} position={[x, 0, z]}>
                <boxGeometry args={[0.2, 0.04, 0.1]} />
                <meshStandardMaterial color="#c9ccd6" roughness={0.28} metalness={0.9} />
              </mesh>
            )
          }),
        )}

        {/* Capacitors */}
        {[
          [-1.0, -0.62],
          [1.0, 0.62],
          [0.95, -0.68],
        ].map(([x, z], index) => (
          <mesh key={`cap-${index}`} position={[x, 0.12, z]}>
            <cylinderGeometry args={[0.09, 0.09, 0.16, 16]} />
            <meshStandardMaterial color="#1a1a1e" roughness={0.4} metalness={0.3} />
          </mesh>
        ))}

        {/* Green spill so the board glows against the dark finale. */}
        <pointLight position={[0, 1.2, 1.8]} intensity={8} color="#39ff6a" distance={10} decay={2} />
      </group>
    </group>
  )
}

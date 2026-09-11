// Transition clouds: soft white puff clusters that fade in mid-scroll while
// the camera dives, then fade out as the garden finale arrives. Opacity is
// driven per-frame by SceneRig (cloudMat); visibility toggles on the group.
export default function CloudLayer({ groupRef, clouds, cloudMaterial, puffShapes }) {
  return (
    <group ref={groupRef} visible={false}>
      {clouds.map((cloud, cloudIndex) => (
        <group key={cloudIndex} position={cloud.pos} scale={cloud.s}>
          {puffShapes.map((puff, puffIndex) => (
            <mesh key={puffIndex} position={[puff[0], puff[1], puff[2]]} material={cloudMaterial}>
              <sphereGeometry args={[puff[3], 16, 16]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

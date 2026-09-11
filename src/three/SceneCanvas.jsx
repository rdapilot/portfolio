import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scroll, ScrollControls } from '@react-three/drei'
import SceneRig from './SceneRig.jsx'
import KeyboardScroll from './KeyboardScroll.jsx'
import HtmlPages from '../components/ui/HtmlPages.jsx'

// The full 3D journey, isolated in its own module so App can React.lazy it —
// none of three.js ships in the initial bundle. Receives only the card-select
// callback; everything else is owned inside.
export default function SceneCanvas({ onSelectCard }) {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      camera={{ fov: 50, position: [0, 1.2, 5.2], near: 0.1, far: 60 }}
    >
      {/* Base lighting; SceneRig adds the animated carousel light */}
      <hemisphereLight skyColor="#5588bb" groundColor="#112233" intensity={0.6} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, 3, -5]} intensity={0.6} />
      <pointLight position={[0, 0, 5]} intensity={8} distance={20} decay={2} />
      <ScrollControls pages={4} damping={0.22} distance={1}>
        <KeyboardScroll />
        <Suspense fallback={null}>
          <SceneRig onSelect={onSelectCard} />
        </Suspense>
        <Scroll html style={{ width: '100%' }}>
          <HtmlPages />
        </Scroll>
      </ScrollControls>
    </Canvas>
  )
}

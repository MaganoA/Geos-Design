import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import { MachineModelSuspense } from './machine-model'
import { PerfHud } from './helpers/perf-hud'

export function Viewport() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Single camera definition — PerspectiveCamera makeDefault owns the camera slot */}
      <PerspectiveCamera makeDefault position={[8, 6, 10]} fov={35} />
      <Environment preset="studio" background={false} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 4]} intensity={1.1} castShadow={false} />
      <MachineModelSuspense />
      <ContactShadows position={[0, 0, 0]} opacity={0.35} blur={2.5} far={4} />
      <PerfHud />
    </Canvas>
  )
}

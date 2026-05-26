import { Suspense } from 'react'
import { useMachineGLTF } from './assets'

export function MachineModel() {
  const { scene } = useMachineGLTF()
  return <primitive object={scene} />
}

export function MachineModelSuspense() {
  return (
    <Suspense fallback={null}>
      <MachineModel />
    </Suspense>
  )
}

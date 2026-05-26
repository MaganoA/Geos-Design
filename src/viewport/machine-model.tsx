import { Suspense, useEffect, useMemo } from 'react'
import { allDevices } from '@/devices'
import { useMachineGLTF } from './assets'
import { buildDeviceMeshIndex, type MeshIndexEntry } from './device-meshes'

export interface MachineModelProps {
  onIndex?: (index: Record<string, MeshIndexEntry>) => void
}

export function MachineModel({ onIndex }: MachineModelProps) {
  const { scene } = useMachineGLTF()
  const index = useMemo(
    () => buildDeviceMeshIndex(scene, allDevices().map((d) => d.meta)),
    [scene],
  )

  useEffect(() => {
    onIndex?.(index)
    if (import.meta.env.DEV) {
      const matched = Object.keys(index)
      const all = allDevices()
        .map((d) => d.meta.id)
        .filter((id) => id !== '_stub')
      const unmatched = all.filter((id) => !matched.includes(id))
      // eslint-disable-next-line no-console
      console.info('[viewport] mesh matches:', { matched, unmatched })
    }
  }, [index, onIndex])

  return <primitive object={scene} />
}

export function MachineModelSuspense(props: MachineModelProps) {
  return (
    <Suspense fallback={null}>
      <MachineModel {...props} />
    </Suspense>
  )
}

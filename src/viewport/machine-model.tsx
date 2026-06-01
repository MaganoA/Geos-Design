import { Suspense, useEffect, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Mesh, MeshStandardMaterial } from 'three'
import { allDevices } from '@/devices'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { useSelectionStore } from '@/store/selection-store'
import { useMachineGLTF } from './assets'
import { buildDeviceMeshIndex, type MeshIndexEntry } from './device-meshes'

export interface MachineModelProps {
  onIndex?: (index: Record<string, MeshIndexEntry>) => void
}

/**
 * Resolves a mesh name to the device it belongs to. Linear scan of the
 * index — fine at our scale (≤50 entries), keeps the data flow simple.
 */
function findDeviceIdForMesh(
  meshName: string,
  idx: Record<string, MeshIndexEntry>,
): string | null {
  for (const [id, entry] of Object.entries(idx)) {
    if (entry.meshes.some((m) => m.name === meshName)) return id
  }
  return null
}

export function MachineModel({ onIndex }: MachineModelProps) {
  const { scene } = useMachineGLTF()
  const setHovered = useSelectionStore((s) => s.setHovered)
  const { select } = useSelectedDevice()

  const index = useMemo(
    () => buildDeviceMeshIndex(scene, allDevices().map((d) => d.meta)),
    [scene],
  )

  // Dial the GLB's HDR coupling down without flattening its native
  // roughness palette. The asset already authors dark steel vs. white
  // housing with different roughness values; clobbering them would
  // erase the contrast that makes the render read as a technical
  // illustration. We *only* tamp envMapIntensity so the (near-zero)
  // scene environment doesn't lift the blacks into greys.
  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const m of mats) {
        if (m instanceof MeshStandardMaterial) {
          // Tighter clamp so the dark steel frame doesn't pick up any
          // HDR reflection and lift into mid-grey.
          m.envMapIntensity = 0.12
          m.needsUpdate = true
        }
      }
    })
  }, [scene])

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

  function onPointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    const name = (e.object as { name?: string }).name ?? ''
    setHovered(findDeviceIdForMesh(name, index))
  }
  function onPointerOut() {
    setHovered(null)
  }
  function onClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    const name = (e.object as { name?: string }).name ?? ''
    const id = findDeviceIdForMesh(name, index)
    if (id) select(id)
  }

  return (
    <primitive
      object={scene}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    />
  )
}

export function MachineModelSuspense(props: MachineModelProps) {
  return (
    <Suspense fallback={null}>
      <MachineModel {...props} />
    </Suspense>
  )
}

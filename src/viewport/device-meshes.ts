import { Box3, Object3D, Vector3, Mesh } from 'three'

interface DeviceWithMeshes {
  id: string
  meshNames?: string[]
}

export interface MeshIndexEntry {
  meshes: Mesh[]
  boundingBox: Box3
  center: Vector3
}

function nameMatches(name: string, pattern: string): boolean {
  if (!pattern.endsWith('*')) return name === pattern
  const prefix = pattern.slice(0, -1)
  return name.startsWith(prefix)
}

export function buildDeviceMeshIndex(
  scene: Object3D,
  devices: DeviceWithMeshes[],
): Record<string, MeshIndexEntry> {
  const meshesByName: Mesh[] = []
  scene.traverse((obj) => {
    if ((obj as Mesh).isMesh) meshesByName.push(obj as Mesh)
  })

  const out: Record<string, MeshIndexEntry> = {}
  for (const dev of devices) {
    const patterns = dev.meshNames ?? []
    if (patterns.length === 0) continue
    const matched = meshesByName.filter((m) => patterns.some((p) => nameMatches(m.name, p)))
    if (matched.length === 0) continue
    const bbox = new Box3()
    for (const m of matched) bbox.expandByObject(m)
    const center = new Vector3()
    bbox.getCenter(center)
    out[dev.id] = { meshes: matched, boundingBox: bbox, center }
  }
  return out
}

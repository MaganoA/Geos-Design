import { describe, it, expect } from 'vitest'
import { Object3D, Mesh, BoxGeometry, MeshBasicMaterial } from 'three'
import { buildDeviceMeshIndex } from './device-meshes'

function mesh(name: string) {
  const m = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial())
  m.name = name
  return m
}

describe('buildDeviceMeshIndex', () => {
  it('matches by exact name', () => {
    const scene = new Object3D()
    scene.add(mesh('Portale_Testa_1'))
    const index = buildDeviceMeshIndex(scene, [
      { id: 'portale-testa-1', meshNames: ['Portale_Testa_1'] },
    ])
    expect(index['portale-testa-1']?.meshes).toHaveLength(1)
  })

  it('matches by glob suffix', () => {
    const scene = new Object3D()
    scene.add(mesh('Portale_Testa_1'))
    scene.add(mesh('Portale_Testa_1_Sub'))
    const index = buildDeviceMeshIndex(scene, [
      { id: 'portale-testa-1', meshNames: ['Portale_Testa_1', 'Portale_Testa_1_*'] },
    ])
    expect(index['portale-testa-1']?.meshes).toHaveLength(2)
  })

  it('omits devices with no matches', () => {
    const scene = new Object3D()
    const index = buildDeviceMeshIndex(scene, [
      { id: 'robot', meshNames: ['Robot_*'] },
    ])
    expect(index.robot).toBeUndefined()
  })
})

import { describe, it, expect } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { captureView } from './capture-view'

describe('captureView', () => {
  it('captures position + target', () => {
    const cam = new PerspectiveCamera()
    cam.position.set(8, 6, 10)
    const target = new Vector3(0, 0, 0)
    const view = captureView(cam, target)
    expect(view.position).toEqual([8, 6, 10])
    expect(view.target).toEqual([0, 0, 0])
  })
})

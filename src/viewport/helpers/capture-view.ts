import type { Camera, Vector3 } from 'three'

export interface CapturedView {
  position: [number, number, number]
  target: [number, number, number]
}

export function captureView(cam: Camera, target: Vector3): CapturedView {
  return {
    position: [cam.position.x, cam.position.y, cam.position.z],
    target: [target.x, target.y, target.z],
  }
}

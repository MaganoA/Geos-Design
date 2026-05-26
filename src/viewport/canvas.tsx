import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import { Box3, MathUtils, Mesh, PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from 'three'
import { useSelectionStore } from '@/store/selection-store'
import { useMachineGLTF } from './assets'
import { MachineModelSuspense } from './machine-model'
import { PerfHud } from './helpers/perf-hud'

// ─── Camera geometry ──────────────────────────────────────────────────────
// Fixed isometric-ish 3/4 view direction. Locking the direction here means
// we never drift into a different perspective when fitting different
// canvas sizes — only the distance to the target changes.
const CAMERA_FOV_DEG = 35
const CAMERA_DIR = new Vector3(0.6, 0.4, 0.75).normalize()
// 1.0 = the machine's bounding-sphere exactly fits the smaller of the
// canvas dimensions. <1 crops slightly (the floor's outer edge can leave
// the frame, the machine body itself stays visible). Tuned tighter so
// the machine reads as the subject, not a miniature on a big sheet.
const FIT_MARGIN = 0.72

// Critically-damped lerp coefficient for the camera animation.
// λ = 7 → ~63 % progress at 140 ms, ~90 % at 320 ms, ~99 % at 640 ms.
// 320 ms is the grid-columns transition duration, so the 3D camera reads
// as moving in sync with the surrounding layout chrome. No bounce —
// critically damped to fit Emil's "no overshoot" UI heuristic and the
// project's "no bounce, no elastic" motion law.
const DAMP_LAMBDA = 7

/**
 * Bbox of the *machine body only*, excluding near-planar meshes (floor,
 * label decals). The GLB's floor extends asymmetrically to +X, which
 * would bias a naive scene-bbox centre to the right of the visible
 * machine. Skipping flat geometry gives a centre that matches what the
 * eye reads as "the machine".
 */
function useMachineBox() {
  const { scene } = useMachineGLTF()
  return useMemo(() => {
    const box = new Box3()
    const meshBox = new Box3()
    const meshSize = new Vector3()
    let captured = false
    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      meshBox.setFromObject(obj)
      if (meshBox.isEmpty()) return
      meshBox.getSize(meshSize)
      const sorted = [meshSize.x, meshSize.y, meshSize.z].sort((a, b) => b - a)
      const longest = sorted[0] ?? 0
      const shortest = sorted[2] ?? 0
      // Thickness < 5% of footprint → treat as planar decor and skip.
      if (longest > 0 && shortest / longest < 0.05) return
      box.union(meshBox)
      captured = true
    })
    if (!captured) box.setFromObject(scene)
    return box
  }, [scene])
}

/**
 * Owns the camera. We deliberately bypass drei's <PerspectiveCamera> and
 * speak to R3F's default camera directly, because we need (a) lookAt to
 * stick across renders and (b) reactivity to canvas size — both fight
 * the declarative wrapper.
 *
 * Animation strategy: `useEffect` computes the *desired* position + look-at
 * target whenever the canvas (or model) changes and stashes them in refs.
 * `useFrame` then damps the *actual* camera transform toward those refs
 * each frame, so panel-open/close transitions ride along with the
 * surrounding layout instead of snapping. Damping is interruptible —
 * rapid panel toggles smoothly retarget instead of restarting.
 */
function CameraRig() {
  const machineBox = useMachineBox()
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  // Target values driven by layout. `currentLookAt` carries the camera's
  // *animated* look-at point so it can interpolate alongside position —
  // snapping lookAt while damping position would twist the view mid-move.
  const desiredPos = useRef(new Vector3())
  const desiredLookAt = useRef(new Vector3())
  const currentLookAt = useRef(new Vector3())
  const initialised = useRef(false)

  useEffect(() => {
    if (!(camera instanceof ThreePerspectiveCamera)) return
    const center = machineBox.getCenter(new Vector3())
    const boxSize = machineBox.getSize(new Vector3())
    // Bounding-sphere radius that comfortably encloses the projected bbox
    // at the chosen view angle. 0.62 ≈ half the diagonal of a cube.
    const radius = Math.max(boxSize.x, boxSize.y, boxSize.z) * 0.62
    const fov = (CAMERA_FOV_DEG * Math.PI) / 180
    const aspect = size.width / Math.max(size.height, 1)
    // Distance needed so the sphere of radius `radius` fills the vertical
    // FoV vs the horizontal FoV. The bigger of the two wins — that's the
    // limiting axis.
    const distForVertical = radius / Math.sin(fov / 2)
    const distForHorizontal = distForVertical / aspect
    const distance = Math.max(distForVertical, distForHorizontal) * FIT_MARGIN

    // Bias the look-at point downward by a fraction of the machine's
    // height. The 3/4 view from above tends to drop the projected
    // machine into the lower half of the frame; lowering the target
    // pulls the model upward in screen space until it reads as
    // vertically centred.
    const VERTICAL_BIAS = 0.18
    const aimedCenter = center.clone()
    aimedCenter.y -= boxSize.y * VERTICAL_BIAS
    desiredPos.current.copy(aimedCenter).add(CAMERA_DIR.clone().multiplyScalar(distance))
    desiredLookAt.current.copy(aimedCenter)

    camera.fov = CAMERA_FOV_DEG
    camera.aspect = aspect
    camera.near = 0.1
    camera.far = Math.max(1000, distance * 4)
    camera.updateProjectionMatrix()

    // First frame: snap so the model is already in place when the canvas
    // appears (we don't want an animation *into* the initial view from the
    // default camera at [0, 0, 5]).
    if (!initialised.current) {
      camera.position.copy(desiredPos.current)
      currentLookAt.current.copy(desiredLookAt.current)
      camera.lookAt(currentLookAt.current)
      initialised.current = true
    }
  }, [camera, machineBox, size.width, size.height])

  useFrame((_, delta) => {
    if (!(camera instanceof ThreePerspectiveCamera)) return
    const dp = desiredPos.current
    const dl = desiredLookAt.current
    const cl = currentLookAt.current
    camera.position.x = MathUtils.damp(camera.position.x, dp.x, DAMP_LAMBDA, delta)
    camera.position.y = MathUtils.damp(camera.position.y, dp.y, DAMP_LAMBDA, delta)
    camera.position.z = MathUtils.damp(camera.position.z, dp.z, DAMP_LAMBDA, delta)
    cl.x = MathUtils.damp(cl.x, dl.x, DAMP_LAMBDA, delta)
    cl.y = MathUtils.damp(cl.y, dl.y, DAMP_LAMBDA, delta)
    cl.z = MathUtils.damp(cl.z, dl.z, DAMP_LAMBDA, delta)
    camera.lookAt(cl)
  })

  return null
}

function Scene() {
  const setMeshIndex = useSelectionStore((s) => s.setMeshIndex)
  return (
    <>
      <CameraRig />
      <Environment preset="studio" background={false} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 4]} intensity={1.1} castShadow={false} />
      <MachineModelSuspense onIndex={setMeshIndex} />
      <ContactShadows position={[0, 0, 0]} opacity={0.35} blur={2.5} far={4} />
      <PerfHud />
    </>
  )
}

// Canvas DOM starts at the LeftPanel's right edge (16 px gutter + 348 px
// panel). The 3D viewport's geometric centre then coincides with the
// centre of the area NOT covered by the panel — combined with the camera
// targeting the machine-only centre, the model reads as visually centred
// across every panel state.
const LEFT_PANEL_INSET = 16 + 348

export function Viewport() {
  return (
    // Wrap in a positioned div: R3F's Canvas pins its own wrapper to
    // width/height 100 %, overriding any inset we'd pass via its `style`
    // prop. So we position THIS div and let the Canvas fill it.
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: LEFT_PANEL_INSET,
        transition: 'left 320ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

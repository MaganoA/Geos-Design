import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import { Box3, MathUtils, Mesh, PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from 'three'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { useSelectionStore } from '@/store/selection-store'
import { useMachineGLTF } from './assets'
import { MachineModelSuspense } from './machine-model'
import { SelectionOutline } from './outline'
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
// Sub-assembly framing leaves more headroom so the surrounding machine
// reads as context, not as crop.
const FIT_MARGIN_SUBASSEMBLY = 1.4

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
  const meshIndex = useSelectionStore((s) => s.meshIndex)
  const { id: selectedId } = useSelectedDevice()

  // Frame the selected device's bbox when one is selected AND has matched
  // meshes; otherwise frame the whole machine. Selecting a category that
  // has no mesh data (e.g. a tree group) falls back to the machine view —
  // we never zoom into nothing.
  const framingBox = useMemo(() => {
    if (selectedId && meshIndex[selectedId]?.boundingBox) {
      return meshIndex[selectedId].boundingBox
    }
    return machineBox
  }, [selectedId, meshIndex, machineBox])

  // Target values driven by layout + selection. `currentLookAt` carries
  // the camera's *animated* look-at point so it can interpolate alongside
  // position — snapping lookAt while damping position would twist the
  // view mid-move.
  const desiredPos = useRef(new Vector3())
  const desiredLookAt = useRef(new Vector3())
  const currentLookAt = useRef(new Vector3())
  const initialised = useRef(false)

  useEffect(() => {
    if (!(camera instanceof ThreePerspectiveCamera)) return
    const center = framingBox.getCenter(new Vector3())
    const boxSize = framingBox.getSize(new Vector3())
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
    // Looser margin (more headroom) when zoomed into a subassembly so the
    // surrounding context isn't completely clipped.
    const margin = framingBox === machineBox ? FIT_MARGIN : FIT_MARGIN_SUBASSEMBLY
    const distance = Math.max(distForVertical, distForHorizontal) * margin

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
  }, [camera, framingBox, machineBox, size.width, size.height])

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

      {/* Warm-grey backdrop — the machine renders mostly in cool whites,
       *  so a slightly warm canvas separates the silhouette from the
       *  background without competing for attention. */}
      <color attach="background" args={['#f3f1ee']} />

      {/* Three-point setup tuned for an industrial HMI render — clarity
       *  over photoreal. Key light is off the camera axis so the model
       *  picks up real form shading instead of flat front-lighting. */}
      <hemisphereLight
        args={['#ffffff', '#d8d6d2', 0.35]}
        position={[0, 1, 0]}
      />
      <directionalLight
        position={[8, 14, -2]}
        intensity={1.4}
        castShadow={false}
      />
      <directionalLight
        position={[-7, 5, 4]}
        intensity={0.45}
        castShadow={false}
      />
      <directionalLight
        position={[-2, 6, -8]}
        intensity={0.25}
        castShadow={false}
      />

      {/* Environment is for PBR reflections only — drei's `studio` preset
       *  is far too bright as a primary light source. `apartment` is
       *  softer; the intensity is dialled down so the HDR shows up in
       *  highlights without dominating the diffuse term. */}
      <Environment
        preset="apartment"
        background={false}
        environmentIntensity={0.35}
      />

      <SelectionOutline>
        <MachineModelSuspense onIndex={setMeshIndex} />
      </SelectionOutline>

      {/* Contact shadow grounds the model. Opacity bumped from 0.35 so
       *  the machine reads as resting on the floor, not floating above
       *  it under the new lower-exposure lighting. */}
      <ContactShadows position={[0, 0, 0]} opacity={0.55} blur={2.4} far={4} />
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
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          // ACES is R3F's default; pinning the exposure here trims the
          // highlights without muddying the midtones. The machine's
          // white metals stay white but stop blooming under the HDR.
          toneMappingExposure: 0.85,
        }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

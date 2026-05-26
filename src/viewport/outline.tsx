import type { ReactNode } from 'react'
import { EffectComposer, Outline, Select, Selection } from '@react-three/postprocessing'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { useSelectionStore } from '@/store/selection-store'

/**
 * Wraps scene contents in a post-process outline pass. Hovered + selected
 * device meshes are passed through `<Select>`, which the Outline effect
 * picks up and renders an edge-strength glow around. Hovered visual is
 * suppressed when the hovered device IS already the selected one (no
 * point drawing the outline twice).
 */
export function SelectionOutline({ children }: { children: ReactNode }) {
  const hoveredId = useSelectionStore((s) => s.hoveredId)
  const meshIndex = useSelectionStore((s) => s.meshIndex)
  const { id: selectedId } = useSelectedDevice()

  const selectedMeshes = selectedId ? meshIndex[selectedId]?.meshes ?? [] : []
  const hoveredMeshes =
    hoveredId && hoveredId !== selectedId ? meshIndex[hoveredId]?.meshes ?? [] : []

  return (
    <Selection>
      <EffectComposer multisampling={4} autoClear={false}>
        <Outline
          edgeStrength={2.5}
          visibleEdgeColor={0x14110f}
          hiddenEdgeColor={0x14110f}
          blur={false}
        />
      </EffectComposer>
      <Select enabled={selectedMeshes.length > 0}>
        {selectedMeshes.map((m, i) => (
          <primitive key={`sel-${i}`} object={m} />
        ))}
      </Select>
      <Select enabled={hoveredMeshes.length > 0}>
        {hoveredMeshes.map((m, i) => (
          <primitive key={`hov-${i}`} object={m} />
        ))}
      </Select>
      {children}
    </Selection>
  )
}

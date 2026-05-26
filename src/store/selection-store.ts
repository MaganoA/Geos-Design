import { create } from 'zustand'
import type { MeshIndexEntry } from '@/viewport/device-meshes'

interface SelectionState {
  hoveredId: string | null
  setHovered: (id: string | null) => void
  meshIndex: Record<string, MeshIndexEntry>
  setMeshIndex: (i: Record<string, MeshIndexEntry>) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  hoveredId: null,
  setHovered: (hoveredId) => set({ hoveredId }),
  meshIndex: {},
  setMeshIndex: (meshIndex) => set({ meshIndex }),
}))

import { create } from 'zustand'

interface SelectionState {
  hoveredId: string | null
  setHovered: (id: string | null) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  hoveredId: null,
  setHovered: (hoveredId) => set({ hoveredId }),
}))

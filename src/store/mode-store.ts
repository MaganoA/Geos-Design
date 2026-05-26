import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Mode = 'auto' | 'manuale'

interface ModeState {
  mode: Mode
  setMode: (m: Mode) => void
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'manuale',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'flexpin1.mode' },
  ),
)

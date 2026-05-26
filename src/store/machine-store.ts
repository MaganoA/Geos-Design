import { create } from 'zustand'

export interface MachineState {
  devices: Record<string, unknown>
  setDevice<T>(id: string, next: T): void
  patchDevice<T extends object>(id: string, patch: Partial<T>): void
  tick: number
}

export const useMachineStore = create<MachineState>((set) => ({
  devices: {},
  tick: 0,
  setDevice: (id, next) =>
    set((s) => ({ devices: { ...s.devices, [id]: next } })),
  patchDevice: (id, patch) =>
    set((s) => ({
      devices: {
        ...s.devices,
        [id]: { ...(s.devices[id] as object), ...patch },
      },
    })),
}))

// Single shared interval for ALL ticking devices. One timer in flight
// regardless of how many devices register — Zustand updates are batched
// into a single render per tick.
const TICK_MS = 100
let interval: ReturnType<typeof setInterval> | null = null
const tickers: Array<(dtMs: number) => void> = []

export function registerTicker(fn: (dtMs: number) => void): () => void {
  tickers.push(fn)
  if (!interval) {
    interval = setInterval(() => {
      for (const t of tickers) t(TICK_MS)
      useMachineStore.setState((s) => ({ tick: s.tick + 1 }))
    }, TICK_MS)
  }
  return () => {
    const i = tickers.indexOf(fn)
    if (i >= 0) tickers.splice(i, 1)
    if (tickers.length === 0 && interval) {
      clearInterval(interval)
      interval = null
    }
  }
}

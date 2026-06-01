import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import type { SpeedState } from './state'

const DEVICE_ID = 'speed'

/**
 * Indexed table snap: every Gira tavola tap advances the rotary
 * carousel by 90°, wrapping past 360. The applyTick simulation keeps
 * the underlying angle drifting continuously, so the snap is a quick
 * teleport relative to the live angle.
 */
function snapTavola() {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as SpeedState | undefined
  if (!prev) return
  const nextQuarter = Math.floor(prev.angoloAsseC / 90 + 1) * 90
  const angoloAsseC = nextQuarter % 360
  s.setDevice(DEVICE_ID, { ...prev, angoloAsseC })
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.gira-tavola`,
    label: 'Gira tavola',
    description: 'Ruota la tavola di 90° (snap al prossimo quarto)',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => snapTavola(),
  },
]

import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type SpeedSoffiatoreState } from './state'

const DEVICE_ID = 'speed-soffiatore'

function update(patch: Partial<SpeedSoffiatoreState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as SpeedSoffiatoreState | undefined
  if (!prev) return
  const next: SpeedSoffiatoreState = { ...prev, ...patch }
  next.status = deriveStatus(next.accese, next.codiceErrori)
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.accendi`,
    label: 'Accendi',
    description: 'Accende il soffiatore',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: true }),
  },
  {
    id: `${DEVICE_ID}.spegni`,
    label: 'Spegni',
    description: 'Spegne il soffiatore',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: false }),
  },
]

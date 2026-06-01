import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type SpeedBarraLavaggioState } from './state'

const DEVICE_ID = 'speed-barra-lavaggio'

function update(patch: Partial<SpeedBarraLavaggioState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as SpeedBarraLavaggioState | undefined
  if (!prev) return
  const next: SpeedBarraLavaggioState = { ...prev, ...patch }
  next.status = deriveStatus(next.accese, next.codiceErrori)
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.accendi`,
    label: 'Accendi',
    description: 'Accende la barra di lavaggio',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: true }),
  },
  {
    id: `${DEVICE_ID}.spegni`,
    label: 'Spegni',
    description: 'Spegne la barra di lavaggio',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: false }),
  },
]

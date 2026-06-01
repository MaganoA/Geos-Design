import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type ImpiantoAcquaState } from './state'

const DEVICE_ID = 'impianto-acqua'

function update(patch: Partial<ImpiantoAcquaState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as ImpiantoAcquaState | undefined
  if (!prev) return
  const next: ImpiantoAcquaState = { ...prev, ...patch }
  next.status = deriveStatus(next.accese, next.codiceErrori)
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.accendi`,
    label: 'Accendi',
    description: "Accende l'impianto acqua",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: true }),
  },
  {
    id: `${DEVICE_ID}.spegni`,
    label: 'Spegni',
    description: "Spegne l'impianto acqua",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: false }),
  },
]

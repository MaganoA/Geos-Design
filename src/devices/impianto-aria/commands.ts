import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type ImpiantoAriaState } from './state'

const DEVICE_ID = 'impianto-aria'

function update(patch: Partial<ImpiantoAriaState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as ImpiantoAriaState | undefined
  if (!prev) return
  const next: ImpiantoAriaState = { ...prev, ...patch }
  next.status = deriveStatus(next.accese, next.codiceErrori)
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.accendi`,
    label: 'Accendi',
    description: "Accende l'impianto aria",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: true }),
  },
  {
    id: `${DEVICE_ID}.spegni`,
    label: 'Spegni',
    description: "Spegne l'impianto aria",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: false }),
  },
]

import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type ErogazioneResinaSerbatoioState } from './state'

const DEVICE_ID = 'erogazione-resina-serbatoio'

function update(patch: Partial<ErogazioneResinaSerbatoioState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as
    | ErogazioneResinaSerbatoioState
    | undefined
  if (!prev) return
  const next: ErogazioneResinaSerbatoioState = { ...prev, ...patch }
  next.status = deriveStatus(
    next.pressioneOk,
    next.livello,
    next.limiteMinimo,
    next.pressurizzazione,
  )
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.attiva-pressurizzazione`,
    label: 'Attiva pressurizzazione',
    description: "Pressurizza l'impianto resina",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ pressurizzazione: true }),
  },
  {
    id: `${DEVICE_ID}.disattiva-pressurizzazione`,
    label: 'Disattiva pressurizzazione',
    description: 'Sfiata la pressurizzazione',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ pressurizzazione: false }),
  },
]

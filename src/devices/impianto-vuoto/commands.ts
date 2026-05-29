import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type ImpiantoVuotoState } from './state'

const DEVICE_ID = 'impianto-vuoto'

function update(patch: Partial<ImpiantoVuotoState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as ImpiantoVuotoState | undefined
  if (!prev) return
  const next: ImpiantoVuotoState = { ...prev, ...patch }
  next.status = deriveStatus(
    next.accese,
    next.pompa1Attiva,
    next.pompa2Attiva,
    next.codiceErrori,
  )
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.accendi`,
    label: 'Accendi',
    description: "Accende l'impianto del vuoto",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: true }),
  },
  {
    id: `${DEVICE_ID}.spegni`,
    label: 'Spegni',
    description: "Spegne l'impianto del vuoto",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: false }),
  },
  {
    id: `${DEVICE_ID}.attiva-pompa-1`,
    label: 'Attiva pompa 1',
    description: 'Attiva la pompa del vuoto numero 1',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ pompa1Attiva: true }),
  },
  {
    id: `${DEVICE_ID}.disattiva-pompa-1`,
    label: 'Disattiva pompa 1',
    description: 'Disattiva la pompa del vuoto numero 1',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ pompa1Attiva: false }),
  },
  {
    id: `${DEVICE_ID}.attiva-pompa-2`,
    label: 'Attiva pompa 2',
    description: 'Attiva la pompa del vuoto numero 2',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ pompa2Attiva: true }),
  },
  {
    id: `${DEVICE_ID}.disattiva-pompa-2`,
    label: 'Disattiva pompa 2',
    description: 'Disattiva la pompa del vuoto numero 2',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ pompa2Attiva: false }),
  },
]

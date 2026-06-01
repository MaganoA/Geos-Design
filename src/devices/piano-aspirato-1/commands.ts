import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import {
  deriveStatus,
  recomputeVentose,
  type PianoAspirato1State,
} from './state'

const DEVICE_ID = 'piano-aspirato-1'

type Modalita = 'vuoto' | 'soffio'

function setModalita(next: Modalita) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PianoAspirato1State | undefined
  if (!prev) return
  if (prev.modalita === next) return
  const ventose = recomputeVentose(prev.ventose, next)
  s.setDevice(DEVICE_ID, {
    ...prev,
    modalita: next,
    ventose,
    status: deriveStatus(prev.codiceErrori),
  })
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.modalita-vuoto`,
    label: 'Vuoto',
    description: 'Mette il piano in modalità vuoto',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => setModalita('vuoto'),
  },
  {
    id: `${DEVICE_ID}.modalita-soffio`,
    label: 'Soffio',
    description: 'Mette il piano in modalità soffio',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => setModalita('soffio'),
  },
]

// Used by the toolbar to highlight the currently-engaged mode without
// string matching.
export const COMMAND_MODE: Record<string, Modalita> = {
  [`${DEVICE_ID}.modalita-vuoto`]: 'vuoto',
  [`${DEVICE_ID}.modalita-soffio`]: 'soffio',
}

import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import {
  deriveStatus,
  recomputeVentose,
  type PianoAspirato2State,
} from './state'

const DEVICE_ID = 'piano-aspirato-2'

type Modalita = 'vuoto' | 'soffio'

function setModalita(next: Modalita) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PianoAspirato2State | undefined
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
  // Guided procedure entry-point: opens the confirm dialog. The actual
  // multi-step "seleziona le lastre da saltare" wizard is a follow-up
  // (custom UI, not just confirm/cancel) — for now the handler is a
  // placeholder that documents the contract.
  {
    id: `${DEVICE_ID}.by-pass`,
    label: 'Procedura di By-pass',
    description:
      'Avvia la procedura guidata di by-pass: seleziona le lastre da saltare.',
    requiredRole: 'admin',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => {
      // Macro lato portale — il vero wizard di selezione lastre vive
      // fuori da questo device. Confermare apre la procedura.
    },
  },
]

export const COMMAND_MODE: Record<string, Modalita> = {
  [`${DEVICE_ID}.modalita-vuoto`]: 'vuoto',
  [`${DEVICE_ID}.modalita-soffio`]: 'soffio',
}

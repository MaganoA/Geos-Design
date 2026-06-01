import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import {
  deriveStatus,
  type ErogazioneResinaAlimentatoreInsertiState,
} from './state'

const DEVICE_ID = 'erogazione-resina-alimentatore-inserti'

function update(patch: Partial<ErogazioneResinaAlimentatoreInsertiState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as
    | ErogazioneResinaAlimentatoreInsertiState
    | undefined
  if (!prev) return
  const next: ErogazioneResinaAlimentatoreInsertiState = { ...prev, ...patch }
  next.status = deriveStatus(next.acceso, next.codiceErrori)
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.accendi`,
    label: 'Accendi',
    description: "Accende l'alimentatore inserti",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ acceso: true }),
  },
  {
    id: `${DEVICE_ID}.spegni`,
    label: 'Spegni',
    description: "Spegne l'alimentatore inserti",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ acceso: false }),
  },
  {
    id: `${DEVICE_ID}.cambia-pin`,
    label: 'Cambia pin',
    description:
      'Procedura guidata: svuota vibroalimentatore e carica nuovo modello',
    requiredRole: 'operatore',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => {
      const s = useMachineStore.getState()
      const prev = s.devices[DEVICE_ID] as
        | ErogazioneResinaAlimentatoreInsertiState
        | undefined
      if (!prev) return
      update({ idFlexpin: prev.idFlexpin === 1 ? 2 : 1 })
    },
  },
]

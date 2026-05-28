import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type PortaleTesta2GripperPinState } from './state'

const DEVICE_ID = 'portale-testa-2-gripper-pin'

function update(
  patch: Partial<PortaleTesta2GripperPinState>,
  recomputeStatus = true,
) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PortaleTesta2GripperPinState | undefined
  if (!prev) return
  const next: PortaleTesta2GripperPinState = { ...prev, ...patch }
  if (recomputeStatus) {
    next.status = deriveStatus(next.inRotazione, next.stato)
  }
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.apri`,
    label: 'Apri',
    description: 'Apre le ganasce del gripper',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ stato: 'aperto' }),
  },
  {
    id: `${DEVICE_ID}.chiudi`,
    label: 'Chiudi',
    description: 'Chiude le ganasce del gripper',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ stato: 'chiuso' }),
  },
  {
    id: `${DEVICE_ID}.modifica-angolo`,
    label: 'Modifica angolo',
    description: "Imposta l'angolo di destinazione del gripper",
    requiredRole: 'operatore',
    manualOnly: true,
    requiresValueInput: {
      min: 0,
      max: 90,
      step: 1,
      unit: '°',
      initial: (s) => (s as PortaleTesta2GripperPinState).angoloDestinazione,
    },
    handler: (ctx) => {
      if (ctx.value === undefined) return
      update({ angoloDestinazione: ctx.value }, false)
    },
  },
  {
    id: `${DEVICE_ID}.ruota`,
    label: 'Ruota',
    description: 'Avvia o ferma la rotazione verso la destinazione',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => {
      const s = useMachineStore.getState()
      const prev = s.devices[DEVICE_ID] as
        | PortaleTesta2GripperPinState
        | undefined
      if (!prev) return
      update({ inRotazione: !prev.inRotazione })
    },
  },
  {
    id: `${DEVICE_ID}.preleva-pin`,
    label: 'Preleva un pin',
    description: 'Procedura guidata: chiude le ganasce per prelevare un pin',
    requiredRole: 'operatore',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => update({ stato: 'chiuso' }),
  },
]

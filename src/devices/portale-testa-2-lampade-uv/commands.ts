import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type PortaleTesta2LampadeUvState } from './state'

const DEVICE_ID = 'portale-testa-2-lampade-uv'

function update(patch: Partial<PortaleTesta2LampadeUvState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PortaleTesta2LampadeUvState | undefined
  if (!prev) return
  const next: PortaleTesta2LampadeUvState = { ...prev, ...patch }
  next.status = deriveStatus(next.accese, next.intensita, next.codiceErrori)
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.accendi`,
    label: 'Accendi lampade',
    description: "Accende le lampade UV. Attenzione: rischio di esposizione UV.",
    requiredRole: 'operatore',
    manualOnly: true,
    requiresConfirm: true,
    handler: () => update({ accese: true }),
  },
  {
    id: `${DEVICE_ID}.spegni`,
    label: 'Spegni lampade',
    description: 'Spegne le lampade UV',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: false }),
  },
  {
    id: `${DEVICE_ID}.modifica-potenza`,
    label: 'Modifica potenza',
    description: "Imposta l'intensità delle lampade UV in percentuale",
    requiredRole: 'operatore',
    manualOnly: true,
    requiresValueInput: {
      min: 0,
      max: 100,
      step: 5,
      unit: '%',
      initial: (s) => (s as PortaleTesta2LampadeUvState).intensita,
    },
    handler: (ctx) => {
      if (ctx.value === undefined) return
      update({ intensita: ctx.value })
    },
  },
  {
    id: `${DEVICE_ID}.slitta-alta`,
    label: 'Slitta alta',
    description: 'Solleva la slitta delle lampade UV',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ slittaPosizione: 'alta' }),
  },
  {
    id: `${DEVICE_ID}.slitta-bassa`,
    label: 'Slitta bassa',
    description: 'Abbassa la slitta delle lampade UV',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ slittaPosizione: 'bassa' }),
  },
]

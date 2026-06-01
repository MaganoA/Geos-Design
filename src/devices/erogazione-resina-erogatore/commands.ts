import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type ErogazioneResinaErogatoreState } from './state'

const DEVICE_ID = 'erogazione-resina-erogatore'

function update(patch: Partial<ErogazioneResinaErogatoreState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as
    | ErogazioneResinaErogatoreState
    | undefined
  if (!prev) return
  const next: ErogazioneResinaErogatoreState = { ...prev, ...patch }
  next.status = deriveStatus(next.stato, next.ariaCompressa)
  s.setDevice(DEVICE_ID, next)
}

/**
 * Spurgo (compressed-air purge) routes through two access tiers:
 *  - superadmin direct toggles: `aria-compressa-on/off` for raw control
 *  - admin guided procedures: `spurgo-on/off` for the supervised flow
 * Both mutate the same `ariaCompressa` flag — the difference is in the
 * confirmation chrome and role gate.
 */
export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.aria-compressa-on`,
    label: 'Aria compressa on',
    description: "Attiva l'aria compressa (spurgo)",
    requiredRole: 'superadmin',
    manualOnly: true,
    requiresConfirm: true,
    handler: () => update({ ariaCompressa: true }),
  },
  {
    id: `${DEVICE_ID}.aria-compressa-off`,
    label: 'Aria compressa off',
    description: "Disattiva l'aria compressa",
    requiredRole: 'superadmin',
    manualOnly: true,
    handler: () => update({ ariaCompressa: false }),
  },
  {
    id: `${DEVICE_ID}.cambio-ugello`,
    label: 'Cambio ugello',
    description: "Avvia la macro di cambio ugello (portale)",
    requiredRole: 'superadmin',
    manualOnly: true,
    requiresConfirm: true,
    handler: () => {},
  },
  {
    id: `${DEVICE_ID}.spurgo-on`,
    label: 'Attiva spurgo',
    description: 'Procedura guidata: avvia spurgo',
    requiredRole: 'admin',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => update({ ariaCompressa: true }),
  },
  {
    id: `${DEVICE_ID}.spurgo-off`,
    label: 'Disattiva spurgo',
    description: 'Procedura guidata: termina spurgo',
    requiredRole: 'admin',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => update({ ariaCompressa: false }),
  },
]

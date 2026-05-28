import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type PortaleTesta1ErogatoreState } from './state'

const DEVICE_ID = 'portale-testa-1-erogatore'

/**
 * Drive the purge cycle. The valve mirrors the purge (open while
 * purging, closed at rest); the compressed-air supply is a separate
 * switch and isn't touched here.
 */
function setSpurgo(active: boolean) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PortaleTesta1ErogatoreState | undefined
  if (!prev) return
  s.setDevice(DEVICE_ID, {
    ...prev,
    spurgoAttivo: active,
    stato: active ? 'aperto' : 'chiuso',
    status: deriveStatus(active, prev.ariaCompressaAttiva),
  })
}

/**
 * Toggle the compressed-air supply. Independent of the purge — turning
 * the air on doesn't start a purge, and stopping the air doesn't end
 * one already in progress.
 */
function toggleAriaCompressa() {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PortaleTesta1ErogatoreState | undefined
  if (!prev) return
  const next = !prev.ariaCompressaAttiva
  s.setDevice(DEVICE_ID, {
    ...prev,
    ariaCompressaAttiva: next,
    status: deriveStatus(prev.spurgoAttivo, next),
  })
}

export const commands: Command[] = [
  // Superadmin, manual: raw compressed-air toggle (press on, press off),
  // behind a confirm modal. Drives only the air supply.
  {
    id: `${DEVICE_ID}.aria-compressa`,
    label: 'Aria compressa',
    description:
      "Attiva o disattiva la mandata di aria compressa all'erogatore. Premi di nuovo per spegnere.",
    requiredRole: 'superadmin',
    manualOnly: true,
    requiresConfirm: true,
    handler: () => toggleAriaCompressa(),
  },
  // Superadmin, manual: nozzle change. The actual motion lives in the
  // portal macros; here it's the operator-facing entry point.
  {
    id: `${DEVICE_ID}.cambio-ugello`,
    label: 'Cambio ugello',
    description: "Avvia la procedura di cambio ugello dell'erogatore.",
    requiredRole: 'superadmin',
    manualOnly: true,
    requiresConfirm: true,
    handler: () => {
      // Cambio ugello: macro lato portale (fuori da questo device).
    },
  },
  // Admin, manual: guided purge procedures, each behind a confirm modal.
  {
    id: `${DEVICE_ID}.attiva-spurgo`,
    label: 'Attiva spurgo',
    description: 'Procedura guidata: attiva lo spurgo ad aria compressa.',
    requiredRole: 'admin',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => setSpurgo(true),
  },
  {
    id: `${DEVICE_ID}.disattiva-spurgo`,
    label: 'Disattiva spurgo',
    description: 'Procedura guidata: disattiva lo spurgo ad aria compressa.',
    requiredRole: 'admin',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => setSpurgo(false),
  },
]

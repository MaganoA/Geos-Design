import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import type { PortaleTesta1TenutaState, TenutaModalita } from './state'

const DEVICE_ID = 'portale-testa-1-tenuta'

/**
 * Set the test-rig mode. Exclusive: the three modes (soffio /
 * aspirazione / niente) are mutually exclusive, so each command just
 * writes the new mode. applyTick then drives the depression toward
 * that mode's target on the shared tick loop.
 */
function setModalita(modalita: TenutaModalita) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PortaleTesta1TenutaState | undefined
  if (!prev) return
  if (prev.modalita === modalita) return
  s.setDevice(DEVICE_ID, { ...prev, modalita })
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.aspirazione`,
    label: 'Aspirazione',
    description: 'Mette in aspirazione il sistema di prova tenuta',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => setModalita('aspirazione'),
  },
  {
    id: `${DEVICE_ID}.soffio`,
    label: 'Soffio',
    description: 'Mette in soffio il sistema di prova tenuta',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => setModalita('soffio'),
  },
  {
    id: `${DEVICE_ID}.niente`,
    label: 'Niente',
    description: 'Disattiva soffio e aspirazione',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => setModalita('niente'),
  },
]

// Lets the toolbar map command id → mode to highlight the active one
// without string-matching.
export const COMMAND_MODE: Record<string, TenutaModalita> = {
  [`${DEVICE_ID}.aspirazione`]: 'aspirazione',
  [`${DEVICE_ID}.soffio`]: 'soffio',
  [`${DEVICE_ID}.niente`]: 'niente',
}

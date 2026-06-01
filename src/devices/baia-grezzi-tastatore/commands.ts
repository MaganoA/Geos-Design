import type { Command } from '@/types/command'

const DEVICE_ID = 'baia-grezzi-tastatore'

/**
 * The allineatori are physical actuators; the commands trigger motion
 * on the real machine. Here we keep them no-op handlers (visible/
 * dispatched, but no local state changes) — the laser reads in state
 * drift independently on tick to represent the live measurement.
 */
export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.lungo-avanti`,
    label: 'Lungo avanti',
    description: "Muove l'allineatore lungo in avanti",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => {},
  },
  {
    id: `${DEVICE_ID}.lungo-indietro`,
    label: 'Lungo indietro',
    description: "Muove l'allineatore lungo indietro",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => {},
  },
  {
    id: `${DEVICE_ID}.sinistra-avanti`,
    label: 'Sinistra avanti',
    description: "Muove l'allineatore sinistro in avanti",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => {},
  },
  {
    id: `${DEVICE_ID}.sinistra-indietro`,
    label: 'Sinistra indietro',
    description: "Muove l'allineatore sinistro indietro",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => {},
  },
  {
    id: `${DEVICE_ID}.destra-avanti`,
    label: 'Destra avanti',
    description: "Muove l'allineatore destro in avanti",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => {},
  },
  {
    id: `${DEVICE_ID}.destra-indietro`,
    label: 'Destra indietro',
    description: "Muove l'allineatore destro indietro",
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => {},
  },
]

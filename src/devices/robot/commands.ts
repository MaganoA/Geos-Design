import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type RobotState } from './state'

const DEVICE_ID = 'robot'

interface Pose {
  /** J1…J6 in degrees. */
  angoli: number[]
  /** Linear gantry travel in mm. */
  distanza: number
}

/**
 * Operator-facing macros that snap the robot to a known station. These
 * are placeholders for the real motion plans — the HMI just writes the
 * target pose into state so the panel reads back the same numbers the
 * controller would send.
 */
export const POSITION_PRESETS: Record<string, Pose> = {
  'tutto-a-sinistra': {
    angoli: [-90, 0, 0, 0, 0, 0],
    distanza: 0,
  },
  'tutto-a-destra': {
    angoli: [90, 0, 0, 0, 0, 0],
    distanza: 2400,
  },
  'vai-piano-aspirato': {
    angoli: [0, -30, 90, 0, 60, 0],
    distanza: 1200,
  },
  'vai-baia-grezzi': {
    angoli: [-60, 15, 60, 0, 30, -45],
    distanza: 400,
  },
  'vai-baia-lavorati': {
    angoli: [60, 15, 60, 0, 30, 45],
    distanza: 2000,
  },
}

function goTo(presetId: keyof typeof POSITION_PRESETS) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as RobotState | undefined
  if (!prev) return
  const preset = POSITION_PRESETS[presetId]!
  s.setDevice(DEVICE_ID, {
    ...prev,
    angoli: preset.angoli,
    distanza: preset.distanza,
    status: deriveStatus(prev.codiceErrori),
  })
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.tutto-a-sinistra`,
    label: 'Tutto a sinistra',
    description: 'Porta il robot al fondo corsa sinistro del gantry',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => goTo('tutto-a-sinistra'),
  },
  {
    id: `${DEVICE_ID}.tutto-a-destra`,
    label: 'Tutto a destra',
    description: 'Porta il robot al fondo corsa destro del gantry',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => goTo('tutto-a-destra'),
  },
  {
    id: `${DEVICE_ID}.vai-piano-aspirato`,
    label: 'Piano aspirato',
    description: 'Allinea il robot sul frame del piano aspirato',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => goTo('vai-piano-aspirato'),
  },
  {
    id: `${DEVICE_ID}.vai-baia-grezzi`,
    label: 'Baia grezzi',
    description: 'Allinea il robot sul frame della baia dei grezzi',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => goTo('vai-baia-grezzi'),
  },
  {
    id: `${DEVICE_ID}.vai-baia-lavorati`,
    label: 'Baia lavorati',
    description: 'Allinea il robot sul frame della baia dei lavorati',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => goTo('vai-baia-lavorati'),
  },
]

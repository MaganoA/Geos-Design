import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { type ToolStandGripperugrandeState } from './state'

const DEVICE_ID = 'tool-stand-gripper-grande'

function update(patch: Partial<ToolStandGripperugrandeState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as ToolStandGripperugrandeState | undefined
  if (!prev) return
  s.setDevice(DEVICE_ID, { ...prev, ...patch })
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.modifica-dx`,
    label: 'Modifica dx',
    description: "Imposta l'apertura del gripper sull'asse X (mm)",
    requiredRole: 'superadmin',
    manualOnly: true,
    requiresValueInput: {
      min: 0,
      max: 200,
      step: 1,
      unit: 'mm',
      initial: (s) => (s as ToolStandGripperugrandeState).dx,
    },
    handler: (ctx) => {
      if (ctx.value === undefined) return
      update({ dx: ctx.value })
    },
  },
  {
    id: `${DEVICE_ID}.modifica-dy`,
    label: 'Modifica dy',
    description: "Imposta l'apertura del gripper sull'asse Y (mm)",
    requiredRole: 'superadmin',
    manualOnly: true,
    requiresValueInput: {
      min: 0,
      max: 200,
      step: 1,
      unit: 'mm',
      initial: (s) => (s as ToolStandGripperugrandeState).dy,
    },
    handler: (ctx) => {
      if (ctx.value === undefined) return
      update({ dy: ctx.value })
    },
  },
]

import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import type { PortaleTesta2State } from './state'

type RestMode = 'riposo-1' | 'riposo-2'

const REST_TARGETS: Record<RestMode, { x: number; y: number; z: number }> = {
  'riposo-1': { x: 0, y: 0, z: 0 },
  'riposo-2': { x: 3500, y: 0, z: 0 },
}

function toggleMode(target: RestMode) {
  const s = useMachineStore.getState()
  const prev = s.devices['portale-testa-2'] as PortaleTesta2State | undefined
  if (!prev) return
  if (prev.mode === target) {
    s.setDevice('portale-testa-2', {
      ...prev,
      mode: 'operativa',
      positionTarget: prev.position,
    })
    return
  }
  s.setDevice('portale-testa-2', {
    ...prev,
    mode: target,
    positionTarget: REST_TARGETS[target],
  })
}

export const commands: Command[] = [
  {
    id: 'portale-testa-2.riposo-1',
    label: 'Riposo 1',
    description: 'Sposta la testa fuori ingombro 1',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => toggleMode('riposo-1'),
  },
  {
    id: 'portale-testa-2.riposo-2',
    label: 'Riposo 2',
    description: 'Sposta la testa fuori ingombro 2',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => toggleMode('riposo-2'),
  },
]

// Toolbar uses this to highlight the active mode without string matching.
export const COMMAND_MODE: Record<string, RestMode> = {
  'portale-testa-2.riposo-1': 'riposo-1',
  'portale-testa-2.riposo-2': 'riposo-2',
}

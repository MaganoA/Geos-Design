import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import type { PortaleTesta1State } from './state'

type RestMode = 'riposo-1' | 'riposo-2'

const REST_TARGETS: Record<RestMode, { x: number; y: number; z: number }> = {
  'riposo-1': { x: 0, y: 0, z: 0 },
  'riposo-2': { x: 3500, y: 0, z: 0 },
}

/**
 * Toggle into/out of a Riposo mode. Clicking the active mode returns
 * the head to Operativa (mode = 'operativa', target is left wherever
 * the head currently is so the random-drift can resume from there).
 */
function toggleMode(target: RestMode) {
  const s = useMachineStore.getState()
  const prev = s.devices['portale-testa-1'] as PortaleTesta1State | undefined
  if (!prev) return
  if (prev.mode === target) {
    s.setDevice('portale-testa-1', {
      ...prev,
      mode: 'operativa',
      positionTarget: prev.position,
    })
    return
  }
  s.setDevice('portale-testa-1', {
    ...prev,
    mode: target,
    positionTarget: REST_TARGETS[target],
  })
}

export const commands: Command[] = [
  {
    id: 'portale-testa-1.riposo-1',
    label: 'Riposo 1',
    description: 'Sposta la testa fuori ingombro 1',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => toggleMode('riposo-1'),
  },
  {
    id: 'portale-testa-1.riposo-2',
    label: 'Riposo 2',
    description: 'Sposta la testa fuori ingombro 2',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => toggleMode('riposo-2'),
  },
]

// The toolbar uses this to map command index → state mode so it knows
// which button is the "active" one without doing string matching.
export const COMMAND_MODE: Record<string, RestMode> = {
  'portale-testa-1.riposo-1': 'riposo-1',
  'portale-testa-1.riposo-2': 'riposo-2',
}

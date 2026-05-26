import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import type { PortaleTesta1State } from './state'

const REST_1 = { x: 0, y: 0, z: 0 }
const REST_2 = { x: 3500, y: 0, z: 0 }

function setTarget(target: typeof REST_1) {
  const s = useMachineStore.getState()
  const prev = s.devices['portale-testa-1'] as PortaleTesta1State | undefined
  if (!prev) return
  s.setDevice('portale-testa-1', { ...prev, positionTarget: target })
}

export const commands: Command[] = [
  {
    id: 'portale-testa-1.riposo-1',
    label: 'Riposo 1',
    description: 'Sposta la testa fuori ingombro 1',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => setTarget(REST_1),
  },
  {
    id: 'portale-testa-1.riposo-2',
    label: 'Riposo 2',
    description: 'Sposta la testa fuori ingombro 2',
    requiredRole: 'operatore',
    manualOnly: true,
    destructive: true,
    handler: () => setTarget(REST_2),
  },
]

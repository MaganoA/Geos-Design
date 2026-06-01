import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import {
  PISTONI_COUNT,
  deriveStatus,
  type DispenserDistanzialiState,
} from './state'

const DEVICE_ID = 'dispenser-distanziali'

function setPistone(index: number, stato: 'avanti' | 'indietro') {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as DispenserDistanzialiState | undefined
  if (!prev) return
  const pistoni = prev.pistoni.map((p, i) =>
    i === index ? { ...p, stato } : p,
  )
  s.setDevice(DEVICE_ID, {
    ...prev,
    pistoni,
    status: deriveStatus(pistoni, prev.codiceErrori),
  })
}

/**
 * Per-piston direct command pair (12 total). Superadmin-only because
 * moving an individual cilindro out of sequence can jam the cassette.
 */
export const commands: Command[] = Array.from(
  { length: PISTONI_COUNT },
  (_, i) => i,
).flatMap((i) => [
  {
    id: `${DEVICE_ID}.pistone-${i + 1}.avanti`,
    label: `P${i + 1} avanti`,
    description: `Muove avanti il pistone ${i + 1}`,
    requiredRole: 'superadmin',
    manualOnly: true,
    handler: () => setPistone(i, 'avanti'),
  } as Command,
  {
    id: `${DEVICE_ID}.pistone-${i + 1}.indietro`,
    label: `P${i + 1} indietro`,
    description: `Muove indietro il pistone ${i + 1}`,
    requiredRole: 'superadmin',
    manualOnly: true,
    handler: () => setPistone(i, 'indietro'),
  } as Command,
])

import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type GripperKind, type ToolStandState } from './state'

const DEVICE_ID = 'tool-stand'

const GRIPPER_DEVICE_ID: Record<GripperKind, string> = {
  piccolo: 'tool-stand-gripper-piccolo',
  medio: 'tool-stand-gripper-medio',
  grande: 'tool-stand-gripper-grande',
  distanziali: 'tool-stand-gripper-distanziali',
}

/**
 * Mount a specific gripper on the robot head: writes the choice to the
 * tool-stand state AND flips the gripper's stato to its default
 * mounted modality ('niente' = idle suction, until the operator picks
 * vuoto/soffio). Posa reverses both writes, returning the gripper to
 * its 'a-magazzino' parked state.
 */
function preleva(kind: GripperKind) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as ToolStandState | undefined
  if (!prev) return

  // Tool stand: mark which gripper is mounted.
  s.setDevice(DEVICE_ID, {
    ...prev,
    gripperMontato: kind,
    status: deriveStatus(kind),
  })

  // Gripper itself: out of magazzino → mounted with default modality.
  // The distanziali gripper has no modality state in its schema, so we
  // only patch the stato when the device exposes one.
  const gripperId = GRIPPER_DEVICE_ID[kind]
  const gripperState = s.devices[gripperId] as
    | { stato?: 'a-magazzino' | 'vuoto' | 'soffio' | 'niente' }
    | undefined
  if (gripperState && 'stato' in gripperState) {
    s.setDevice(gripperId, { ...gripperState, stato: 'niente' })
  }
}

function posa() {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as ToolStandState | undefined
  if (!prev) return

  // Park whichever gripper was mounted.
  if (prev.gripperMontato !== null) {
    const gripperId = GRIPPER_DEVICE_ID[prev.gripperMontato]
    const gripperState = s.devices[gripperId] as
      | { stato?: 'a-magazzino' | 'vuoto' | 'soffio' | 'niente' }
      | undefined
    if (gripperState && 'stato' in gripperState) {
      s.setDevice(gripperId, { ...gripperState, stato: 'a-magazzino' })
    }
  }

  s.setDevice(DEVICE_ID, {
    ...prev,
    gripperMontato: null,
    status: deriveStatus(null),
  })
}

const SETUP_DESCRIPTION = [
  '1) Imposta i valori del gripper (apertura dx, dy).',
  '2) Verifica che le maniglie siano bloccate e conferma.',
  '3) Conferma la procedura.',
].join('\n')

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.preleva-piccolo`,
    label: 'Preleva piccolo',
    description: 'Monta il gripper piccolo e lo porta in avanti',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => preleva('piccolo'),
  },
  {
    id: `${DEVICE_ID}.preleva-medio`,
    label: 'Preleva medio',
    description: 'Monta il gripper medio e lo porta in avanti',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => preleva('medio'),
  },
  {
    id: `${DEVICE_ID}.preleva-grande`,
    label: 'Preleva grande',
    description: 'Monta il gripper grande e lo porta in avanti',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => preleva('grande'),
  },
  {
    id: `${DEVICE_ID}.preleva-distanziali`,
    label: 'Preleva distanziali',
    description: 'Monta il gripper dei distanziali e lo porta in avanti',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => preleva('distanziali'),
  },
  {
    id: `${DEVICE_ID}.posa-gripper`,
    label: 'Posa gripper',
    description: 'Riporta il gripper attualmente montato a magazzino',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => posa(),
  },
  // Guided setup procedures. Multi-step wizard is a follow-up — for now
  // the confirm dialog surfaces the 3 steps in the description so the
  // operator knows what they're committing to.
  {
    id: `${DEVICE_ID}.setup-piccolo`,
    label: 'Setup gripper piccolo',
    description: `Procedura guidata di setup per il gripper piccolo.\n\n${SETUP_DESCRIPTION}`,
    requiredRole: 'admin',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => {
      // Wizard implementation lives in a follow-up — confirming starts the
      // procedure (placeholder).
    },
  },
  {
    id: `${DEVICE_ID}.setup-medio`,
    label: 'Setup gripper medio',
    description: `Procedura guidata di setup per il gripper medio.\n\n${SETUP_DESCRIPTION}`,
    requiredRole: 'admin',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => {},
  },
  {
    id: `${DEVICE_ID}.setup-grande`,
    label: 'Setup gripper grande',
    description: `Procedura guidata di setup per il gripper grande.\n\n${SETUP_DESCRIPTION}`,
    requiredRole: 'admin',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => {},
  },
]

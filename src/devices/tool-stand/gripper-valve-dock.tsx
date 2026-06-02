import { useState } from 'react'
import { useDeviceState } from '@/hooks/use-device-state'
import CogMachineIcon from '@/icons/cog-machine.svg?react'
import DashboardCircleIcon from '@/icons/dashboard-circle.svg?react'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import { DockIconButton } from './dock-icon-button'
import { GripperSetupDialog } from './gripper-setup-dialog'
import { GripperValvoleDialog } from './gripper-valvole-dialog'
import { GripperStatoSegmented } from './gripper-stato-segmented'
import { GRIPPER_DEVICE_ID, type GripperKind } from './state'

interface Props {
  kind: GripperKind
}

/**
 * Bottom dock layout for grippers with valves (piccolo / medio /
 * grande). Two sections separated by a vertical divider:
 *
 *   LEFT   Setup Gripper      → opens a Dialog with two Scrubber +
 *                                Input pairs for dx / dy (replaces
 *                                the two separate modifica-dx /
 *                                modifica-dy CommandButtons).
 *          Modifica Valvole   → opens a Dialog with the four ventose
 *                                as touch toggles.
 *   RIGHT  Stato segmented   → Aspirazione / Soffio / Nessuno
 *                                (only present when the gripper is
 *                                mounted; switching is direct).
 *
 * Mounts itself only when the gripper is on the robot head: parked in
 * magazzino there's nothing to configure here — the operator's next
 * move is to preleva, which lives in GripperMountActions.
 */
export function GripperValveDock({ kind }: Props) {
  const state = useDeviceState<{ stato: string }>(GRIPPER_DEVICE_ID[kind])
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)
  const [setupOpen, setSetupOpen] = useState(false)
  const [valvoleOpen, setValvoleOpen] = useState(false)

  if (!state || state.stato === 'a-magazzino') return null

  // Setup needs superadmin (it mirrors the gate on modifica-dx/-dy).
  const setupDisabled =
    role !== 'superadmin' || mode !== 'manuale'
  // Valvole are operator-level; respect the manual-mode gate.
  const valvoleDisabled = role === 'operatore' && mode !== 'manuale'

  return (
    <>
      <div className="flex h-full items-center gap-4">
        <div className="flex items-center gap-1">
          <DockIconButton
            label="Setup Gripper"
            icon={<CogMachineIcon className="h-5 w-5" />}
            onClick={() => setSetupOpen(true)}
            disabled={setupDisabled}
          />
          <DockIconButton
            label="Modifica Valvole"
            icon={<DashboardCircleIcon className="h-5 w-5" />}
            onClick={() => setValvoleOpen(true)}
            disabled={valvoleDisabled}
          />
        </div>

        <div className="h-[66px] w-px bg-[var(--border-mute)]" aria-hidden />

        <GripperStatoSegmented kind={kind} />
      </div>

      <GripperSetupDialog
        kind={kind}
        open={setupOpen}
        onOpenChange={setSetupOpen}
      />
      <GripperValvoleDialog
        kind={kind}
        open={valvoleOpen}
        onOpenChange={setValvoleOpen}
      />
    </>
  )
}

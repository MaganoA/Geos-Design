import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDeviceState } from '@/hooks/use-device-state'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import { cn } from '@/lib/cn'
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
      <div className="flex h-full items-center gap-3">
        <div className="flex items-center gap-2">
          <DockIconButton
            label="Setup Gripper"
            icon={<SlidersIcon />}
            onClick={() => setSetupOpen(true)}
            disabled={setupDisabled}
          />
          <DockIconButton
            label="Modifica Valvole"
            icon={<GridIcon />}
            onClick={() => setValvoleOpen(true)}
            disabled={valvoleDisabled}
          />
        </div>

        <div className="h-10 w-px bg-[var(--border-mute)]" aria-hidden />

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

function DockIconButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-[52px] min-w-[110px] flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] px-3',
      )}
    >
      <span className="text-[var(--icon-default)]">{icon}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
    </Button>
  )
}

function SlidersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M3 5h7M13 5h2M3 13h2M8 13h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="11.5" cy="5" r="1.7" fill="currentColor" />
      <circle cx="6.5" cy="13" r="1.7" fill="currentColor" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <rect x="3" y="3" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="10" y="3" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="3" y="10" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="10" y="10" width="5" height="5" rx="1" fill="currentColor" />
    </svg>
  )
}

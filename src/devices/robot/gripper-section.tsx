import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { useDeviceState } from '@/hooks/use-device-state'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { canRunCommand } from '@/lib/role-gate'
import {
  GRIPPER_DEVICE_ID,
  GRIPPER_LABEL,
  type GripperKind,
  type ToolStandState,
} from '../tool-stand/state'
import { commands as toolStandCommands } from '../tool-stand/commands'
import { GripperSelectDialog } from './gripper-select-dialog'

const TOOL_STAND_ID = 'tool-stand'

/**
 * Bottom slot of the Robot panel.
 *
 *  - No gripper mounted → primary CTA "Preleva Gripper" that opens a
 *    selection dialog. Disabled when the current role/mode can't run
 *    the underlying tool-stand command (operatore + manuale), so the
 *    button is honest about what it can do.
 *  - A gripper IS mounted → a link card with the gripper's name and a
 *    chevron. Tap navigates to that gripper's own device panel — the
 *    place where the operator can change apertura or modality.
 */
export function GripperSection() {
  const toolStand = useDeviceState<ToolStandState>(TOOL_STAND_ID)
  const { select } = useSelectedDevice()
  const { dispatch, role, mode } = useCommandDispatch()
  const [dialogOpen, setDialogOpen] = useState(false)

  const mounted = toolStand?.gripperMontato ?? null

  if (mounted !== null) {
    return (
      <button
        type="button"
        onClick={() => select(GRIPPER_DEVICE_ID[mounted])}
        className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-mute)] bg-[var(--bg-default)] px-3 py-3 text-left transition-colors hover:bg-[var(--bg-muted)]"
      >
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-active)]" />
          <span className="text-sm font-medium text-[var(--text-default)]">
            {GRIPPER_LABEL[mounted]}
          </span>
        </span>
        <ChevronRight />
      </button>
    )
  }

  // We dispatch the corresponding `tool-stand.preleva-{kind}` command
  // (rather than calling preleva() directly) so the existing role +
  // mode gates and the command bus all stay in the loop. Each preleva
  // command shares the same gating (operatore + manualOnly) so we use
  // any of them as the gate probe.
  const prelevaProbe = toolStandCommands.find(
    (c) => c.id === 'tool-stand.preleva-piccolo',
  )
  const canPreleva = prelevaProbe
    ? canRunCommand(prelevaProbe, role) &&
      (!prelevaProbe.manualOnly || mode === 'manuale')
    : false

  return (
    <>
      <Button
        size="lg"
        className="h-11 w-full"
        disabled={!canPreleva}
        onClick={() => setDialogOpen(true)}
      >
        Preleva Gripper
      </Button>
      <GripperSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={(kind: GripperKind) => {
          const cmd = toolStandCommands.find(
            (c) => c.id === `tool-stand.preleva-${kind}`,
          )
          if (cmd) void dispatch(cmd, TOOL_STAND_ID)
        }}
      />
    </>
  )
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
      className="text-[var(--icon-default-subtle)]"
    >
      <path
        d="M6 4 L10 8 L6 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

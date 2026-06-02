import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { useDeviceState } from '@/hooks/use-device-state'
import ProductSelectionIcon from '@/icons/product-selection.svg?react'
import { canRunCommand } from '@/lib/role-gate'
import { commands as toolStandCommands } from './commands'
import { DockIconButton } from './dock-icon-button'
import { GRIPPER_LABEL, type GripperKind, type ToolStandState } from './state'

const TOOL_STAND_ID = 'tool-stand'
const POSA_ID = 'tool-stand.posa-gripper'

/**
 * Per-gripper primary action: a single contextual CTA that reads the
 * tool-stand mount state and shows the right command for the moment.
 *
 *  - this gripper is the one mounted   →  "Posa Gripper"
 *  - nothing mounted                   →  "Preleva Gripper" (direct)
 *  - a DIFFERENT gripper is mounted    →  "Preleva Gripper" + warn
 *    AlertDialog asking the operator to confirm a swap (posa the
 *    currently-mounted one first, then preleva this one).
 *
 * Underlying commands (operatore + manualOnly) are dispatched via the
 * normal command bus, so role/mode gating and any future audit hooks
 * stay in the loop. The button is disabled when the current
 * role/mode can't run them, mirroring CommandButton's behaviour.
 */
export function GripperMountActions({ kind }: { kind: GripperKind }) {
  const toolStand = useDeviceState<ToolStandState>(TOOL_STAND_ID)
  const { dispatch, role, mode } = useCommandDispatch()
  const [swapOpen, setSwapOpen] = useState(false)

  if (!toolStand) return null

  const mounted = toolStand.gripperMontato
  const isThisMounted = mounted === kind
  const otherMounted = mounted !== null && mounted !== kind

  const posaCmd = toolStandCommands.find((c) => c.id === POSA_ID)
  const prelevaCmd = toolStandCommands.find(
    (c) => c.id === `tool-stand.preleva-${kind}`,
  )
  if (!posaCmd || !prelevaCmd) return null

  // Both commands share the same gating (operatore + manualOnly), so
  // we can probe with whichever is currently relevant.
  const activeCmd = isThisMounted ? posaCmd : prelevaCmd
  const disabled =
    !canRunCommand(activeCmd, role) ||
    (!!activeCmd.manualOnly && mode !== 'manuale')

  if (isThisMounted) {
    return (
      <DockIconButton
        label="Posa Gripper"
        icon={<ProductSelectionIcon className="h-5 w-5" />}
        onClick={() => void dispatch(posaCmd, TOOL_STAND_ID)}
        disabled={disabled}
      />
    )
  }

  if (otherMounted) {
    return (
      <>
        <DockIconButton
          label="Preleva Gripper"
          icon={<ProductSelectionIcon className="h-5 w-5" />}
          onClick={() => setSwapOpen(true)}
          disabled={disabled}
        />
        <AlertDialog open={swapOpen} onOpenChange={setSwapOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sostituire il gripper montato?</AlertDialogTitle>
              <AlertDialogDescription>
                Sulla testa del robot è montato {GRIPPER_LABEL[mounted]}. Per
                prelevare {GRIPPER_LABEL[kind]} il gripper attuale verrà
                prima posato a magazzino.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await dispatch(posaCmd, TOOL_STAND_ID)
                  await dispatch(prelevaCmd, TOOL_STAND_ID)
                }}
              >
                Conferma
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // Nothing mounted — direct preleva, no warning needed.
  return (
    <DockIconButton
      label="Preleva Gripper"
      icon={<ProductSelectionIcon className="h-5 w-5" />}
      onClick={() => void dispatch(prelevaCmd, TOOL_STAND_ID)}
      disabled={disabled}
    />
  )
}

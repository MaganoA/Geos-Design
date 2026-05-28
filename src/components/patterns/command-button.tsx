import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { NumberInputDialog } from '@/components/patterns/number-input-dialog'
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { useDeviceState } from '@/hooks/use-device-state'
import { canRunCommand } from '@/lib/role-gate'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import type { Command } from '@/types/command'

export function CommandButton({
  command,
  deviceId,
}: {
  command: Command
  deviceId: string
}) {
  const { dispatch } = useCommandDispatch()
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)
  const [open, setOpen] = useState(false)
  const deviceState = useDeviceState<unknown>(deviceId)

  const disabled =
    !canRunCommand(command, role) || (command.manualOnly && mode !== 'manuale')

  const buttonClass = 'h-[52px] min-w-[156px]'

  // Value-input branch (numeric setpoint dialog).
  if (command.requiresValueInput) {
    const v = command.requiresValueInput
    const initial = v.initial && deviceState
      ? v.initial(deviceState)
      : (v.min + v.max) / 2
    return (
      <NumberInputDialog
        trigger={
          <Button
            disabled={disabled}
            variant={command.destructive ? 'destructive' : 'default'}
            className={buttonClass}
          >
            {command.label}
          </Button>
        }
        title={command.label}
        description={command.description}
        min={v.min}
        max={v.max}
        step={v.step}
        unit={v.unit}
        initialValue={initial}
        onConfirm={(value) => dispatch(command, deviceId, { value })}
      />
    )
  }

  // Confirm branch (AlertDialog).
  if (command.requiresConfirm) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            disabled={disabled}
            variant={command.destructive ? 'destructive' : 'default'}
            className={buttonClass}
          >
            {command.label}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{command.label}</AlertDialogTitle>
            {command.description && (
              <AlertDialogDescription>{command.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => dispatch(command, deviceId)}>
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Instant branch.
  return (
    <Button
      disabled={disabled}
      variant={command.destructive ? 'destructive' : 'default'}
      className={buttonClass}
      onClick={() => dispatch(command, deviceId)}
    >
      {command.label}
    </Button>
  )
}

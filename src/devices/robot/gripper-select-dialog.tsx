import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMachineStore } from '@/store/machine-store'
import {
  GRIPPER_DEVICE_ID,
  GRIPPER_LABEL,
  gripperKinds,
  type GripperKind,
} from '../tool-stand/state'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (kind: GripperKind) => void
}

/**
 * Operator picks which gripper to mount on the robot. Live dx/dy from
 * each gripper's slice provides the descriptor under the name, so the
 * user can verify the apertura before committing.
 *
 * Selection state is local to the dialog — it resets to the first
 * option each time the dialog reopens, so the operator can't acci-
 * dentally inherit a previous (potentially stale) pick.
 */
export function GripperSelectDialog({ open, onOpenChange, onConfirm }: Props) {
  // Reset to the first option each time the dialog reopens, so the
  // operator never inherits a stale pick from a previous session.
  // Adjusted during render via the React 'storing information from
  // previous renders' pattern — cheaper than useEffect (no extra
  // render per transition) and what react-hooks/set-state-in-effect
  // wants instead of the equivalent useEffect.
  const [selected, setSelected] = useState<GripperKind>('piccolo')
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    if (open) setSelected('piccolo')
    setWasOpen(open)
  }

  // Pull live dx/dy for each gripper so the description matches what
  // the operator would see in the gripper's own panel.
  const devices = useMachineStore((s) => s.devices)
  const aperturaOf = (kind: GripperKind) => {
    const dev = devices[GRIPPER_DEVICE_ID[kind]] as
      | { dx?: number; dy?: number }
      | undefined
    if (!dev || dev.dx === undefined || dev.dy === undefined) return null
    return `${dev.dx} × ${dev.dy} mm`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-0 shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preleva Gripper</DialogTitle>
          <DialogDescription>
            Seleziona il gripper da montare sulla testa del robot.
          </DialogDescription>
        </DialogHeader>

        <div role="radiogroup" aria-label="Gripper" className="flex flex-col gap-2">
          {gripperKinds.map((kind) => {
            const apertura = aperturaOf(kind)
            const isSelected = selected === kind
            return (
              <button
                key={kind}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(kind)}
                onDoubleClick={() => {
                  onConfirm(kind)
                  onOpenChange(false)
                }}
                className={
                  'flex items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors ' +
                  (isSelected
                    ? 'border-[var(--accent)] bg-[color-mix(in_oklch,var(--accent)_8%,transparent)]'
                    : 'border-[var(--border-mute)] bg-transparent hover:bg-[var(--bg-muted)]')
                }
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-[var(--text-default)]">
                    {GRIPPER_LABEL[kind]}
                  </span>
                  {apertura ? (
                    <span className="text-xs tabular-nums text-[var(--text-muted)]">
                      Apertura {apertura}
                    </span>
                  ) : null}
                </div>
                <span
                  aria-hidden
                  className={
                    'grid h-4 w-4 place-items-center rounded-full border ' +
                    (isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--border-default)]')
                  }
                >
                  {isSelected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button
            onClick={() => {
              onConfirm(selected)
              onOpenChange(false)
            }}
          >
            Conferma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

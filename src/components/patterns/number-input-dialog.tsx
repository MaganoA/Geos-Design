import { useEffect, useState, type ReactNode } from 'react'
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

interface NumberInputDialogProps {
  trigger: ReactNode
  title: string
  description?: string
  min: number
  max: number
  step?: number
  unit?: string
  initialValue: number
  onConfirm: (value: number) => void
}

/**
 * Open-bottom variant of the project's AlertDialog with a numeric
 * input. Used by commands that need a setpoint (e.g. gripper angle,
 * UV intensity) — see the requiresValueInput field on Command. The
 * confirmed value is clamped to [min, max].
 */
export function NumberInputDialog({
  trigger,
  title,
  description,
  min,
  max,
  step = 1,
  unit,
  initialValue,
  onConfirm,
}: NumberInputDialogProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<number>(initialValue)

  // Re-seed each time the dialog reopens with the latest live value.
  // This is intentional: we want to sync the input whenever the dialog opens.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setValue(initialValue)
  }, [open, initialValue])

  function clamp(n: number) {
    if (Number.isNaN(n)) return min
    return Math.min(max, Math.max(min, n))
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <div className="flex items-center justify-center gap-2 py-4">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={Number.isNaN(value) ? '' : value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-12 w-28 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-default)] px-3 text-center text-[20px] font-medium tabular-nums text-[var(--text-default)] focus-visible:outline-2 focus-visible:outline-[var(--text-default)]"
            aria-label={title}
          />
          {unit && (
            <span className="text-[16px] text-[var(--text-muted)]">{unit}</span>
          )}
          <span className="text-[13px] text-[var(--text-muted)]">
            ({min}–{max})
          </span>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(clamp(value))}>
            Conferma
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

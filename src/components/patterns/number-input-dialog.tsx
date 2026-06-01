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
import { Input } from '@/components/ui/input'
import { Scrubber } from '@/components/ui/scrubber'
import { cn } from '@/lib/cn'

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
 * Numeric-setpoint dialog used by `requiresValueInput` commands —
 * gripper angle, UV intensity, etc. Mirrors the Setup Gripper dialog's
 * two-control combo so a value setpoint always looks the same across
 * the HMI: a Scrubber for fast drag-to-value and a number Input for
 * keyboard-precise edits. Both bind to the same local draft, so
 * dragging updates the input and typing updates the scrubber's handle.
 *
 * The confirmed value is clamped to [min, max]; the dialog re-seeds
 * with `initialValue` each time it reopens.
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
  // Local text draft so the operator can type freely (including
  // transient values like '' or '6' on the way to '60'). Commits to
  // the canonical numeric value on blur / Enter / Conferma.
  const [text, setText] = useState(String(initialValue))

  // Re-seed each time the dialog reopens with the latest live value.
  // This is intentional: we want to sync the input whenever the dialog opens.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) {
      setValue(initialValue)
      setText(String(initialValue))
    }
  }, [open, initialValue])

  function clamp(n: number) {
    if (Number.isNaN(n)) return min
    return Math.min(max, Math.max(min, n))
  }

  function setBoth(n: number) {
    const c = clamp(Math.round(n / step) * step)
    setValue(c)
    setText(String(c))
  }

  function commitText() {
    const parsed = Number(text)
    if (Number.isFinite(parsed)) {
      setBoth(parsed)
    } else {
      setText(String(value))
    }
  }

  const stepsInRange = Math.floor((max - min) / step)
  const ticks = stepsInRange <= 10 ? stepsInRange + 1 : 11

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

        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Scrubber
                label=""
                value={value}
                min={min}
                max={max}
                step={step}
                decimals={0}
                ticks={ticks}
                showValue={false}
                onValueChange={setBoth}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                inputMode="numeric"
                value={text}
                min={min}
                max={max}
                step={step}
                onChange={(e) => setText(e.currentTarget.value)}
                onBlur={commitText}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitText()
                  }
                }}
                aria-label={title}
                className={cn(
                  'h-9 w-16 text-right tabular-nums',
                  '[appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
                )}
              />
              {unit && (
                <span className="text-xs text-[var(--text-muted)]">{unit}</span>
              )}
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            Intervallo: {min}–{max}
            {unit ? ` ${unit}` : ''}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const parsed = Number(text)
              const final = Number.isFinite(parsed) ? clamp(parsed) : value
              onConfirm(final)
            }}
          >
            Conferma
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

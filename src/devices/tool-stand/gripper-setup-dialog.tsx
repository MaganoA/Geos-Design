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
import { Input } from '@/components/ui/input'
import { Scrubber } from '@/components/ui/scrubber'
import { useMachineStore } from '@/store/machine-store'
import { cn } from '@/lib/cn'
import { GRIPPER_DEVICE_ID, GRIPPER_LABEL, type GripperKind } from './state'

const APERTURA_MIN = 0
const APERTURA_MAX = 200
const APERTURA_STEP = 1

interface Props {
  kind: GripperKind
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AperturaState {
  dx: number
  dy: number
}

/**
 * Setup Gripper modal — picks dx + dy together (replaces the two
 * separate modifica-dx / modifica-dy command buttons). Each axis gets
 * the same two-control combo: a Scrubber for fast drag-to-value, plus
 * a number Input for keyboard-precise edits. Both are bound to the
 * same local value, so dragging updates the input and typing updates
 * the scrubber's handle.
 *
 * Confirm writes both values to the gripper's state slice in one go.
 * Cancel discards. Live re-seed when the modal reopens, so the
 * operator never inherits a stale draft from a previous session.
 */
export function GripperSetupDialog({ kind, open, onOpenChange }: Props) {
  const deviceId = GRIPPER_DEVICE_ID[kind]
  const devices = useMachineStore((s) => s.devices)
  const setDevice = useMachineStore((s) => s.setDevice)
  const current = devices[deviceId] as
    | { dx: number; dy: number }
    | undefined

  // Local draft — only commits on Conferma. Seeded with the live values
  // each time the modal opens via the render-time prop-change pattern
  // (no useEffect + setState).
  const [draft, setDraft] = useState<AperturaState>({
    dx: current?.dx ?? APERTURA_MIN,
    dy: current?.dy ?? APERTURA_MIN,
  })
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    if (open && current) setDraft({ dx: current.dx, dy: current.dy })
    setWasOpen(open)
  }

  const commit = () => {
    if (!current) return
    setDevice(deviceId, { ...current, dx: draft.dx, dy: draft.dy })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup {GRIPPER_LABEL[kind]}</DialogTitle>
          <DialogDescription>
            Imposta l&apos;apertura del gripper sugli assi X e Y.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <AperturaField
            label="Apertura dx"
            value={draft.dx}
            onChange={(dx) => setDraft((d) => ({ ...d, dx }))}
          />
          <AperturaField
            label="Apertura dy"
            value={draft.dy}
            onChange={(dy) => setDraft((d) => ({ ...d, dy }))}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button
            onClick={() => {
              commit()
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

function AperturaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  // Local draft for the input field so the operator can type freely
  // (including transient values like '' or '12' on the way to '120').
  // Commit to the canonical numeric value on blur / Enter.
  const [text, setText] = useState(String(value))
  const [textOwner, setTextOwner] = useState(value)
  if (textOwner !== value) {
    // External change (scrubber drag) overrides the typed draft.
    setText(String(value))
    setTextOwner(value)
  }

  const commitText = () => {
    const parsed = Number(text)
    if (Number.isFinite(parsed)) {
      const clamped = Math.max(APERTURA_MIN, Math.min(APERTURA_MAX, parsed))
      onChange(Math.round(clamped))
    } else {
      // Reset to current canonical on garbage input.
      setText(String(value))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-[var(--text-muted)]">{label}</span>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            inputMode="numeric"
            value={text}
            min={APERTURA_MIN}
            max={APERTURA_MAX}
            step={APERTURA_STEP}
            onChange={(e) => setText(e.currentTarget.value)}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitText()
              }
            }}
            className={cn(
              'h-8 w-20 text-right tabular-nums',
              // Hide the spinner controls so the field reads as a
              // numeric display, not a poorly-styled number picker.
              '[appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
            )}
          />
          <span className="text-xs text-[var(--text-muted)]">mm</span>
        </div>
      </div>
      <Scrubber
        label=""
        value={value}
        min={APERTURA_MIN}
        max={APERTURA_MAX}
        step={APERTURA_STEP}
        decimals={0}
        ticks={11}
        onValueChange={onChange}
      />
    </div>
  )
}

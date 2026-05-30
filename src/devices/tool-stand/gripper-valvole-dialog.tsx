import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMachineStore } from '@/store/machine-store'
import { cn } from '@/lib/cn'
import {
  GRIPPER_DEVICE_ID,
  GRIPPER_LABEL,
  type GripperKind,
} from './state'

interface ValvolaState {
  attiva: boolean
}

interface Props {
  kind: GripperKind
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modifica Valvole modal — interactive grid of the gripper's four
 * suction valves. Tapping a cell toggles `attiva` immediately (no
 * Conferma button needed: the change is reversible from the same
 * surface, and the operator's mental model is "I can flip the valve
 * on and watch what happens"). Closing the modal keeps the latest
 * state.
 */
export function GripperValvoleDialog({ kind, open, onOpenChange }: Props) {
  const deviceId = GRIPPER_DEVICE_ID[kind]
  const devices = useMachineStore((s) => s.devices)
  const setDevice = useMachineStore((s) => s.setDevice)
  const current = devices[deviceId] as
    | { ventose: ValvolaState[] }
    | undefined

  const toggle = (index: number) => {
    if (!current) return
    const ventose = current.ventose.map((v, i) =>
      i === index ? { ...v, attiva: !v.attiva } : v,
    )
    setDevice(deviceId, { ...current, ventose })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica valvole — {GRIPPER_LABEL[kind]}</DialogTitle>
          <DialogDescription>
            Tocca una valvola per attivarla o disattivarla. Le modifiche
            sono immediate.
          </DialogDescription>
        </DialogHeader>

        {/* Round cells — they're the gripper's suction cups, so the
         * visual model should match: four circles arranged in a row,
         * each toggleable, filled accent when active. */}
        <div
          role="group"
          aria-label="Valvole"
          className="grid grid-cols-4 justify-items-center gap-3 py-2"
        >
          {(current?.ventose ?? []).map((v, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={v.attiva}
              aria-label={`Valvola ${i + 1}`}
              onClick={() => toggle(i)}
              className={cn(
                'flex aspect-square w-full max-w-[112px] flex-col items-center justify-center gap-0.5 rounded-full border text-sm font-medium tabular-nums transition-colors',
                v.attiva
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs'
                  : 'border-input bg-background text-[var(--text-muted)] hover:bg-[var(--bg-muted)]',
              )}
            >
              <span className="text-[11px] uppercase tracking-wider opacity-70">
                V{i + 1}
              </span>
              <span className="text-[11px]">
                {v.attiva ? 'on' : 'off'}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

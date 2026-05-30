import { useMachineStore } from '@/store/machine-store'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import { cn } from '@/lib/cn'
import { GRIPPER_DEVICE_ID, type GripperKind } from './state'

type OperatingStato = 'vuoto' | 'soffio' | 'niente'

interface Option {
  value: OperatingStato
  label: string
}

const OPTIONS: Option[] = [
  { value: 'vuoto', label: 'Aspirazione' },
  { value: 'soffio', label: 'Soffio' },
  { value: 'niente', label: 'Nessuno' },
]

interface Props {
  kind: GripperKind
}

/**
 * Three-way segmented control for the gripper's operating mode while
 * mounted. Maps the user-facing labels to the underlying state:
 *
 *   Aspirazione → 'vuoto'
 *   Soffio      → 'soffio'
 *   Nessuno     → 'niente'
 *
 * Direct store write — no command bus — because this is a continuous
 * mode toggle, not a discrete action that wants an audit trail. Role
 * + mode gating still applies: the whole control is disabled unless
 * operatore + manuale, mirroring the preleva/posa gates.
 *
 * Hidden entirely when the gripper isn't mounted (stato ==
 * 'a-magazzino'): switching mode on a parked gripper doesn't make
 * sense and surfacing the control would just confuse the operator.
 */
export function GripperStatoSegmented({ kind }: Props) {
  const deviceId = GRIPPER_DEVICE_ID[kind]
  const devices = useMachineStore((s) => s.devices)
  const setDevice = useMachineStore((s) => s.setDevice)
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)

  const current = devices[deviceId] as { stato: string } | undefined
  if (!current || current.stato === 'a-magazzino') return null

  const stato = current.stato as OperatingStato
  const disabled = role === 'operatore' && mode !== 'manuale'

  const set = (next: OperatingStato) => {
    if (disabled || next === stato) return
    setDevice(deviceId, { ...current, stato: next })
  }

  return (
    <div
      role="radiogroup"
      aria-label="Modalità di aspirazione"
      className={cn(
        'flex items-center gap-0.5 rounded-full bg-[var(--bg-muted)] p-1',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      {OPTIONS.map((o) => {
        const active = o.value === stato
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => set(o.value)}
            disabled={disabled}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors',
              active
                ? 'bg-[var(--bg-default)] text-[var(--text-default)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-default)]',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

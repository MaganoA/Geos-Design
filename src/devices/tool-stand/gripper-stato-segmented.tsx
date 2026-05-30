import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMachineStore } from '@/store/machine-store'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import { cn } from '@/lib/cn'
import { GRIPPER_DEVICE_ID, type GripperKind } from './state'

type OperatingStato = 'vuoto' | 'soffio' | 'niente'

const ORDER: OperatingStato[] = ['vuoto', 'soffio', 'niente']
const LABEL: Record<OperatingStato, string> = {
  vuoto: 'Aspirazione',
  soffio: 'Soffio',
  niente: 'Nessuno',
}

interface Props {
  kind: GripperKind
}

/**
 * Three-way segmented control for the gripper's operating mode while
 * mounted. Built on the shadcn Tabs primitive (no content panels — we
 * only use the trigger row as a single-select segmented). Each trigger
 * carries an inline-SVG icon next to its label so the operator's eye
 * can find a mode by glance, not by reading three words side-by-side.
 *
 * Mapping:
 *   Aspirazione → 'vuoto'   (down-arrow icon: drawing material in)
 *   Soffio      → 'soffio'  (up-arrow with flare: blowing out)
 *   Nessuno     → 'niente'  (horizontal dash: idle)
 *
 * Hidden when the gripper is in magazzino — switching mode on an
 * unmounted gripper makes no sense and surfacing the control would
 * just confuse the operator. Role / mode gating mirrors the
 * preleva-/posa- commands: disabled unless operatore + manuale.
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

  return (
    <Tabs
      value={stato}
      onValueChange={(next) => {
        if (disabled) return
        const v = next as OperatingStato
        if (v === stato) return
        setDevice(deviceId, { ...current, stato: v })
      }}
      className={cn(disabled && 'pointer-events-none opacity-50')}
    >
      <TabsList>
        {ORDER.map((v) => (
          <TabsTrigger
            key={v}
            value={v}
            disabled={disabled}
            className="gap-2 text-xs uppercase tracking-wider"
          >
            <StatoIcon mode={v} />
            {LABEL[v]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

function StatoIcon({ mode }: { mode: OperatingStato }) {
  if (mode === 'vuoto') {
    // Aspirazione — material drawn into the gripper: a down-arrow
    // converging into a small dot.
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <path
          d="M7 2 L7 9 M4 6 L7 9 L10 6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="7" cy="11.5" r="1" fill="currentColor" />
      </svg>
    )
  }
  if (mode === 'soffio') {
    // Soffio — outward blast: an up-arrow with a small flare base.
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <path
          d="M7 12 L7 5 M4 8 L7 5 L10 8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M4.5 3 L7 1.5 L9.5 3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.6"
        />
      </svg>
    )
  }
  // Nessuno — idle, no flow either direction.
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M3 7 L11 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

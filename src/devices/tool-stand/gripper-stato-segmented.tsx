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
 * only use the trigger row as a single-select segmented).
 *
 * Same visual language as the tenuta segmented in the bottom dock:
 * emerald LED dot + normal-case label, so the two surfaces read as
 * the same primitive across the HMI.
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
      <TabsList className="h-[52px] gap-1 rounded-[var(--radius-md)] p-1">
        {ORDER.map((v) => {
          const active = v === stato
          return (
            <TabsTrigger
              key={v}
              value={v}
              disabled={disabled}
              className="min-w-[120px] gap-2 px-4 text-[14px] font-medium"
            >
              <span
                aria-hidden
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full transition-colors',
                  active ? 'bg-emerald-400' : 'bg-stone-300',
                )}
                style={
                  active
                    ? { boxShadow: '0 0 6px rgb(74 222 128 / 0.65)' }
                    : undefined
                }
              />
              {LABEL[v]}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

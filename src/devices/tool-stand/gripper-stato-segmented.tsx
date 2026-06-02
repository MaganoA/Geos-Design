import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ChevronUpIcon from '@/icons/figma-chevron-up.svg?react'
import WindFlowIcon from '@/icons/wind-flow.svg?react'
import { useMachineStore } from '@/store/machine-store'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import { cn } from '@/lib/cn'
import { GRIPPER_DEVICE_ID, type GripperKind } from './state'

type OperatingStato = 'vuoto' | 'soffio' | 'niente'

const ORDER: OperatingStato[] = ['vuoto', 'soffio', 'niente']
const LABEL: Record<OperatingStato, string> = {
  vuoto: 'Aspirato',
  soffio: 'Soffio',
  niente: 'Niente',
}

interface Props {
  kind: GripperKind
}

/**
 * Dock dropdown for the gripper operating mode. The trigger displays
 * the current action and an ON indicator; the menu owns the mutually
 * exclusive choices: Soffio, Aspirato, Niente.
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

  function setStato(next: string) {
    if (disabled) return
    const v = next as OperatingStato
    if (v === stato) return
    setDevice(deviceId, { ...current, stato: v })
  }

  const isOn = stato !== 'niente'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'relative flex h-[66px] min-w-[132px] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-3 text-xs font-normal leading-4 tracking-normal text-[var(--text-default)] outline-none transition-colors hover:bg-[var(--bg-state-soft)] focus-visible:ring-2 focus-visible:ring-[var(--border-input-highlight)]',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <WindFlowIcon className="h-5 w-5 shrink-0 text-[var(--icon-default)]" />
          <span>Aspirazione</span>
          <span
            className={cn(
              'absolute top-1.5 right-7 text-[10px] font-bold leading-4 tracking-[0.02em]',
              isOn ? 'text-[var(--text-success)]' : 'text-[var(--text-muted)]',
            )}
          >
            {isOn ? 'ON' : 'OFF'}
          </span>
          <ChevronUpIcon className="absolute right-3 bottom-5 h-2 w-3 rotate-180 text-[var(--icon-default)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={8}
        className="min-w-[150px] rounded-[var(--radius-md)] border-[var(--border-default)] bg-[var(--bg-modal)] p-1"
      >
        <DropdownMenuRadioGroup value={stato} onValueChange={setStato}>
          {ORDER.map((v) => (
            <DropdownMenuRadioItem
              key={v}
              value={v}
              className="rounded-[var(--radius-sm)] py-2 text-sm text-[var(--text-default)] focus:bg-[var(--bg-state-soft)]"
            >
              {LABEL[v]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

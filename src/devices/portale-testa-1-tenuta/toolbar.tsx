import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMachineStore } from '@/store/machine-store'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import { cn } from '@/lib/cn'
import {
  tenutaModalita,
  type PortaleTesta1TenutaState,
  type TenutaModalita,
} from './state'

const DEVICE_ID = 'portale-testa-1-tenuta'

const LABEL: Record<TenutaModalita, string> = {
  aspirazione: 'Aspirazione',
  soffio: 'Soffio',
  niente: 'Niente',
}

// Display order mirrors the screen brief: aspirazione (the working
// state) reads first, soffio next, niente as the rest position.
const ORDER: TenutaModalita[] = ['aspirazione', 'soffio', 'niente']

/**
 * Three-way segmented control for the test-rig mode. Built on shadcn
 * Tabs (no content panels — only the trigger row, used as a single-
 * select segmented). Mirrors the gripper-stato segmented in look and
 * gating so the two surfaces feel like the same primitive.
 */
export function Toolbar() {
  const devices = useMachineStore((s) => s.devices)
  const setDevice = useMachineStore((s) => s.setDevice)
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)

  const current = devices[DEVICE_ID] as PortaleTesta1TenutaState | undefined
  if (!current) return null

  // Mode gate matches the underlying commands.ts: operatore + manuale.
  // Admin/superadmin still respect manualOnly per the dispatch contract.
  const disabled = role === 'operatore' && mode !== 'manuale'

  return (
    <Tabs
      value={current.modalita}
      onValueChange={(next) => {
        if (disabled) return
        const v = next as TenutaModalita
        if (!tenutaModalita.includes(v) || v === current.modalita) return
        setDevice(DEVICE_ID, { ...current, modalita: v })
      }}
      className={cn(disabled && 'pointer-events-none opacity-50')}
    >
      <TabsList className="h-[52px] gap-1 rounded-[var(--radius-md)] p-1">
        {ORDER.map((v) => {
          const active = v === current.modalita
          return (
            <TabsTrigger
              key={v}
              value={v}
              disabled={disabled}
              className="min-w-[140px] gap-2 px-5 text-[14px] font-medium"
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

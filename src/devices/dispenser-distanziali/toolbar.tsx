import { Button } from '@/components/ui/button'
import { useDeviceState } from '@/hooks/use-device-state'
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import { canRunCommand } from '@/lib/role-gate'
import { cn } from '@/lib/cn'
import { commands } from './commands'
import { PISTONI_COUNT, type DispenserDistanzialiState } from './state'

const DEVICE_ID = 'dispenser-distanziali'

/**
 * Compact per-piston row: each pistone gets a tight Avanti/Indietro
 * pair, with the active direction highlighted by reading the live
 * pistone stato. 6 pistoni × 2 buttons would overflow the dock as
 * standard 156-px CommandButtons; we shrink to fit and trade per-button
 * AlertDialog confirmation for a direct dispatch (superadmin-only).
 */
export function Toolbar() {
  const state = useDeviceState<DispenserDistanzialiState>(DEVICE_ID)
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)
  const { dispatch } = useCommandDispatch()

  if (!state) return null

  return (
    <div className="flex h-full items-center justify-center gap-3">
      {Array.from({ length: PISTONI_COUNT }, (_, i) => {
        const avantiCmd = commands.find(
          (c) => c.id === `${DEVICE_ID}.pistone-${i + 1}.avanti`,
        )!
        const indietroCmd = commands.find(
          (c) => c.id === `${DEVICE_ID}.pistone-${i + 1}.indietro`,
        )!
        const disabled =
          !canRunCommand(avantiCmd, role) || mode !== 'manuale'
        const avantiActive = state.pistoni[i]?.stato === 'avanti'

        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1"
          >
            <div className="text-xs font-medium text-[var(--text-muted)]">
              P{i + 1}
            </div>
            <div className="flex overflow-hidden rounded border border-[var(--border-default)]">
              <Button
                variant="ghost"
                disabled={disabled}
                onClick={() => dispatch(indietroCmd, DEVICE_ID)}
                className={cn(
                  'h-9 w-10 rounded-none border-0',
                  !avantiActive &&
                    'bg-[var(--bg-muted)] text-[var(--text-default)]',
                )}
                aria-label={`Pistone ${i + 1} indietro`}
              >
                ←
              </Button>
              <Button
                variant="ghost"
                disabled={disabled}
                onClick={() => dispatch(avantiCmd, DEVICE_ID)}
                className={cn(
                  'h-9 w-10 rounded-none border-0 border-l border-[var(--border-default)]',
                  avantiActive &&
                    'bg-[var(--bg-muted)] text-[var(--text-default)]',
                )}
                aria-label={`Pistone ${i + 1} avanti`}
              >
                →
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { canRunCommand } from '@/lib/role-gate'
import { cn } from '@/lib/cn'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import type { Command } from '@/types/command'

/**
 * A toggle button used in device toolbars to switch between mutually
 * exclusive modes (Riposo 1/Riposo 2, Soffio/Aspirazione/Niente, ecc.).
 *
 * Visually it's a shadcn `<Button>` with `variant="default"` when the
 * mode is active (charcoal fill) and `variant="outline"` when it isn't,
 * plus an emerald LED dot that's the only chrome carrying the "engaged"
 * signal. Sized at 52×156 px to honour the industrial touch-target
 * minimum (15 mm gloves) — bigger than shadcn's `size="lg"` (40 px).
 */
export function ModeButton({
  command,
  deviceId,
  active,
}: {
  command: Command
  deviceId: string
  active: boolean
}) {
  const { dispatch } = useCommandDispatch()
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)
  const disabled =
    !canRunCommand(command, role) || (command.manualOnly && mode !== 'manuale')

  return (
    <Button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={command.label}
      variant={active ? 'default' : 'outline'}
      disabled={disabled}
      onClick={() => dispatch(command, deviceId)}
      className="h-[52px] min-w-[156px] gap-2 px-5 text-[14px] active:scale-[0.985]"
    >
      <span
        aria-hidden
        className={cn(
          'h-2 w-2 shrink-0 rounded-full transition-colors',
          active ? 'bg-emerald-400' : 'bg-stone-300',
        )}
        style={
          active ? { boxShadow: '0 0 6px rgb(74 222 128 / 0.65)' } : undefined
        }
      />
      <span>{command.label}</span>
    </Button>
  )
}

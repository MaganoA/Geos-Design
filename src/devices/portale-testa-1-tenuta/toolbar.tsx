import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { useDeviceState } from '@/hooks/use-device-state'
import { canRunCommand } from '@/lib/role-gate'
import { cn } from '@/lib/cn'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import type { Command } from '@/types/command'
import { commands, COMMAND_MODE } from './commands'
import type { PortaleTesta1TenutaState } from './state'

export function Toolbar() {
  const state = useDeviceState<PortaleTesta1TenutaState>('portale-testa-1-tenuta')
  const currentMode = state?.modalita ?? 'niente'

  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <ModeButton
          key={c.id}
          command={c}
          deviceId="portale-testa-1-tenuta"
          active={COMMAND_MODE[c.id] === currentMode}
        />
      ))}
    </div>
  )
}

/**
 * A mode-toggle button. Outlined when off; charcoal-filled with a
 * small emerald LED (top-left of the label) when this mode is engaged.
 * Mirrors the Testa 1 toolbar so the three exclusive tenuta modes read
 * identically to every other mode selector on the panel.
 */
function ModeButton({
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
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={command.label}
      disabled={disabled}
      onClick={() => dispatch(command, deviceId)}
      className={cn(
        'flex h-[52px] min-w-[156px] items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-[14px] font-medium transition-all',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-default)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'bg-[var(--text-default)] text-white active:scale-[0.985]'
          : 'bg-[var(--bg-default)] text-[var(--text-default)] hover:bg-[var(--bg-muted)] active:scale-[0.985]',
      )}
      style={
        active ? undefined : { boxShadow: 'inset 0 0 0 1px var(--border-default)' }
      }
    >
      <span
        aria-hidden
        className={cn(
          'h-2 w-2 shrink-0 rounded-full transition-colors',
          active ? 'bg-emerald-400' : 'bg-stone-300',
        )}
        style={active ? { boxShadow: '0 0 6px rgb(74 222 128 / 0.65)' } : undefined}
      />
      <span>{command.label}</span>
    </button>
  )
}

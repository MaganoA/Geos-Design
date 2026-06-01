import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface Props {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}

/**
 * Standard dock toolbar button: ghost variant, vertical layout with
 * an icon on top and a small uppercase label below. Shared across
 * GripperMountActions (Preleva / Posa) and GripperValveDock (Setup,
 * Modifica Valvole) so every item in the dock reads as the same
 * affordance — no more dark filled "default" buttons next to ghost
 * icon stacks.
 */
export function DockIconButton({
  label,
  icon,
  onClick,
  disabled,
  className,
}: Props) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-[52px] min-w-[110px] flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] px-3',
        className,
      )}
    >
      <span className="text-[var(--icon-default)]">{icon}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
    </Button>
  )
}

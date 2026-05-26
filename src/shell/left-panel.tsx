import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import CaretDown from '@/icons/caret-down.svg?react'

export function LeftPanel() {
  return (
    <div
      className="w-[348px] overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-default)]"
      style={{ boxShadow: 'var(--shadow-base)' }}
    >
      <header className="flex flex-col gap-3 px-6 pt-6 pb-5">
        <button type="button" className="flex items-center gap-2 text-left">
          <span
            className="text-3xl font-medium leading-9 text-[var(--text-default)]"
            style={{ letterSpacing: 'var(--tracking-display)' }}
          >
            FlexPin
          </span>
          <CaretDown className="h-5 w-5 text-[var(--icon-default-subtle)]" />
        </button>
        <Badge className="self-start bg-[var(--bg-badge-green)] text-[var(--text-success)] hover:bg-[var(--bg-badge-green)]">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[var(--status-active)]" />
          Attivo
        </Badge>
      </header>
      <ScrollArea className="h-[440px] px-3 pb-5">
        <div className="px-3 text-sm text-[var(--text-muted)]">Tree will render here</div>
      </ScrollArea>
    </div>
  )
}

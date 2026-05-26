import { Badge } from '@/components/ui/badge'
import CaretDown from '@/icons/caret-down.svg?react'
import { DeviceTree } from './tree/device-tree'

export function LeftPanel() {
  return (
    <div
      className="flex max-w-[348px] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-default)]"
      style={{
        boxShadow: 'var(--shadow-base)',
        width: 348,
        // Fluid height: shrink-to-fit the tree, capped at viewport minus
        // the TopBar row, gutters, and BottomToolbar row.
        maxHeight: 'calc(100dvh - 16px - 140px - 16px - 88px - 16px)',
      }}
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
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-5">
        <DeviceTree />
      </div>
    </div>
  )
}

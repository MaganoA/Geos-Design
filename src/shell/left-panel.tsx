import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import CaretDown from '@/icons/caret-down.svg?react'
import { DeviceTree } from './tree/device-tree'

export function LeftPanel() {
  return (
    <div
      className="flex h-full max-h-full max-w-[348px] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-default)]"
      style={{
        boxShadow: 'var(--shadow-base)',
        width: 348,
      }}
    >
      <header className="flex flex-shrink-0 flex-col gap-3 px-6 pt-6 pb-5">
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
      {/*
        type="scroll": Radix shows the scrollbar only while the user is
        scrolling, then fades it out. Matches the Emil rule of "no chrome
        unless it's earned".
      */}
      <ScrollArea type="scroll" className="min-h-0 flex-1 px-3 pb-5">
        <DeviceTree />
      </ScrollArea>
    </div>
  )
}

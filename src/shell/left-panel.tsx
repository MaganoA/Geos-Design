import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import CaretDown from '@/icons/caret-down.svg?react'
import { DeviceTree } from './tree/device-tree'

export function LeftPanel() {
  return (
    // max-h-full = capped at the parent aside (which has top-4 bottom-4 inset,
    // so the cap is "16px from window bottom"). NO h-full — the panel auto-sizes
    // to the tree height when collapsed, then expands as the tree expands,
    // until it hits the cap.
    <div
      className="flex max-h-full max-w-[348px] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-default)]"
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
        No flex-1 here on purpose: ScrollArea sizes to its content by default.
        When the outer panel hits its max-h cap, flex-shrink kicks in and the
        ScrollArea compresses — Radix's Viewport stays size-full so the tree
        inside scrolls. type="scroll" keeps the scrollbar hidden except while
        the user is actively scrolling.
      */}
      <ScrollArea type="scroll" className="min-h-0">
        <div className="px-3 pb-5">
          <DeviceTree />
        </div>
      </ScrollArea>
    </div>
  )
}

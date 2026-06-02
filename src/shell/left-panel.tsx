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
        border: '0.5px solid var(--border-mute)',
        boxShadow: '0 1px 2px -1px rgb(0 0 0 / 0.45), 0 1px 3px 0 rgb(0 0 0 / 0.35)',
        width: 348,
      }}
    >
      <header className="flex flex-shrink-0 flex-col gap-2 px-6 pt-6 pb-5">
        <button type="button" className="flex items-center gap-2 text-left">
          <span
            className="text-2xl font-medium leading-8 text-[var(--text-default)]"
            style={{ letterSpacing: 'var(--tracking-normal)' }}
          >
            FlexPin
          </span>
          <CaretDown className="h-5 w-5 text-[var(--icon-default-subtle)]" />
        </button>
        <Badge className="self-start bg-[var(--bg-basic-cyan-subtle)] px-[9px] py-[3px] text-xs leading-4 text-[var(--bg-basic-cyan-strong)] hover:bg-[var(--bg-basic-cyan-subtle)]">
          Automatico
        </Badge>
      </header>
      {/*
        No flex-1 here on purpose: ScrollArea sizes to its content by default.
        When the outer panel hits its max-h cap, flex-shrink kicks in and the
        ScrollArea compresses — Radix's Viewport stays size-full so the tree
        inside scrolls. type="scroll" keeps the scrollbar hidden except while
        the user is actively scrolling.
      */}
      <ScrollArea type="scroll" className="min-h-0 flex-1 overflow-hidden">
        <div className="px-3 pb-5">
          <DeviceTree />
        </div>
      </ScrollArea>
    </div>
  )
}

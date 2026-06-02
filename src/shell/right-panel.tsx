import XIcon from '@/icons/x.svg?react'
import { StatusBadge } from '@/components/primitives/status-badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDeviceState } from '@/hooks/use-device-state'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import type { DeviceStatus } from '@/types/device'

const STATUS_LABELS: Record<DeviceStatus, string> = {
  active: 'Attivo',
  idle: 'Inattivo',
  warning: 'Attenzione',
  error: 'Errore',
  offline: 'Offline',
}

export function RightPanel() {
  const { device, clear } = useSelectedDevice()
  const visible = !!device && device.meta.hasData !== false

  // RightPanel reads only the `status` slice of whatever the device's
  // live state happens to be — it doesn't know (or need to know) the
  // full shape. Every device that wants a status badge in the header
  // just needs to expose `status: DeviceStatus` in its state.
  const liveSlice = useDeviceState<{ status?: DeviceStatus }>(
    device?.meta.id ?? '__none__',
  )
  const status = liveSlice?.status

  if (!device || !visible) return null

  const { Panel, HeaderExtra, meta } = device
  return (
    <div
      // max-h-[calc(100%-2rem)] (not h-): the card sizes to its content
      // and stops growing 16 px short of the column edges. flex-shrink
      // on the header + scroll-area on the body means the body shrinks
      // first when the content reaches that cap — title and badge
      // always stay visible.
      className="flex max-h-[calc(100dvh-44px)] w-[352px] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-default)]"
      style={{
        border: '0.5px solid var(--border-mute)',
        boxShadow: '0 1px 2px -1px rgb(0 0 0 / 0.45), 0 1px 3px 0 rgb(0 0 0 / 0.35)',
      }}
    >
      <header className="flex flex-shrink-0 items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex flex-col items-start gap-2">
          <span className="text-lg font-medium leading-[22.5px]">{meta.label}</span>
          {(status || HeaderExtra) && (
            <div className="flex flex-wrap items-center gap-2">
              {status && (
                <StatusBadge status={status}>{STATUS_LABELS[status]}</StatusBadge>
              )}
              {HeaderExtra ? <HeaderExtra /> : null}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={clear}
          aria-label="Close"
          className="-mr-1 grid h-8 w-7 shrink-0 place-items-center rounded text-[var(--icon-default-subtle)] transition-transform duration-150 ease-out hover:bg-[var(--bg-state-soft)] hover:text-[var(--icon-default)] active:scale-[0.96]"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </header>
      {/*
        No flex-1: ScrollArea sizes to its content by default and the
        outer card collapses to the natural height. When the content
        exceeds the max-h cap, flex-shrink kicks in and the ScrollArea
        compresses while Radix's Viewport keeps the inner Panel
        scrollable. type="scroll" hides the scrollbar until use.
      */}
      <ScrollArea type="scroll" className="min-h-0">
        <Panel label={meta.label} />
      </ScrollArea>
    </div>
  )
}

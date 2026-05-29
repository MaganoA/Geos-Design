import { useEffect, useState } from 'react'
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

  // After the surrounding grid column animates open we fade the card
  // content in — the column transition is 320 ms (iOS-drawer curve);
  // we delay the fade by ~120 ms so the panel arrives just as the
  // column finishes opening, then settles in ~200 ms.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!visible) {
      setShown(false)
      return
    }
    const id = window.setTimeout(() => setShown(true), 120)
    return () => window.clearTimeout(id)
  }, [visible, device?.meta.id])

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
      className="m-4 ml-0 flex max-h-[calc(100%-2rem)] w-[calc(100%-1rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-default)]"
      style={{
        boxShadow: 'var(--shadow-base)',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateX(0)' : 'translateX(8px)',
        transition:
          'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
      }}
    >
      <header className="flex flex-shrink-0 items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex flex-col items-start gap-2">
          <span className="text-lg font-medium leading-tight">{meta.label}</span>
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
          className="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded text-[var(--icon-default-subtle)] transition-transform duration-150 ease-out hover:bg-[var(--bg-muted)] hover:text-[var(--icon-default)] active:scale-[0.96]"
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

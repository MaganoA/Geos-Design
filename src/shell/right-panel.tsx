import { useEffect, useState } from 'react'
import XIcon from '@/icons/x.svg?react'
import { useSelectedDevice } from '@/hooks/use-selected-device'

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

  if (!device || !visible) return null

  const { Panel, meta } = device
  return (
    <div
      className="m-4 ml-0 flex h-[calc(100%-2rem)] w-[calc(100%-1rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-default)]"
      style={{
        boxShadow: 'var(--shadow-base)',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateX(0)' : 'translateX(8px)',
        transition:
          'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
      }}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
        <span className="text-lg font-medium leading-tight">{meta.label}</span>
        <button
          type="button"
          onClick={clear}
          aria-label="Close"
          className="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded text-[var(--icon-default-subtle)] transition-transform duration-150 ease-out hover:bg-[var(--bg-muted)] hover:text-[var(--icon-default)] active:scale-[0.96]"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </header>
      <div className="flex-1 overflow-auto">
        <Panel label={meta.label} />
      </div>
    </div>
  )
}

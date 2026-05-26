import XIcon from '@/icons/x.svg?react'
import { useSelectedDevice } from '@/hooks/use-selected-device'

export function RightPanel() {
  const { device, clear } = useSelectedDevice()
  if (!device) return null

  const { Panel, meta } = device
  return (
    <div
      className="m-4 ml-0 flex h-[calc(100%-2rem)] w-[calc(100%-1rem)] flex-col overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-default)]"
      style={{ boxShadow: 'var(--shadow-base)' }}
    >
      <header className="flex items-center justify-between border-b border-[var(--border-mute)] px-5 py-4">
        <span className="text-lg font-medium">{meta.label}</span>
        <button
          type="button"
          onClick={clear}
          aria-label="Close"
          className="grid h-8 w-8 place-items-center rounded text-[var(--icon-default-subtle)] transition-transform duration-150 ease-out hover:bg-[var(--bg-muted)] hover:text-[var(--icon-default)] active:scale-[0.96]"
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

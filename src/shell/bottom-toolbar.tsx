import { useSelectedDevice } from '@/hooks/use-selected-device'

export function BottomToolbar() {
  const { device } = useSelectedDevice()

  if (!device || device.meta.hasCommands === false) return null

  const { Toolbar } = device
  return (
    // Card sizes to content — 8 px padding all around the buttons,
    // matching the 8 px gap between them. The asymmetric 24 H / 8 V
    // padding the toolbar shipped with read as "off centre" because
    // the buttons drifted horizontally more than they did vertically.
    <div
      className="flex items-center rounded-[var(--radius-lg)] bg-[var(--bg-default)] p-1 dark:p-2"
      style={{
        border: '0.5px solid var(--border-mute)',
        boxShadow: '0 10px 24px -16px rgb(0 0 0 / 0.80)',
      }}
    >
      <Toolbar />
    </div>
  )
}

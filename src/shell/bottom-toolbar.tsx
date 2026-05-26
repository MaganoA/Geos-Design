import { useSelectedDevice } from '@/hooks/use-selected-device'

export function BottomToolbar() {
  const { device } = useSelectedDevice()
  if (!device) return null
  // Devices without commands (e.g. Vassoio, Fotocellule, Elettroserrature) don't
  // get a bottom toolbar.
  if (device.meta.hasCommands === false) return null

  const { Toolbar } = device
  return (
    <div className="grid h-full place-items-center px-5">
      <div
        className="grid h-[68px] min-w-[348px] place-items-center rounded-[var(--radius-xl)] bg-[var(--bg-default)] px-6"
        style={{ boxShadow: 'var(--shadow-demo)' }}
      >
        <Toolbar />
      </div>
    </div>
  )
}

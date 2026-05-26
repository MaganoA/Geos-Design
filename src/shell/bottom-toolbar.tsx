import { useEffect, useState } from 'react'
import { useSelectedDevice } from '@/hooks/use-selected-device'

export function BottomToolbar() {
  const { device } = useSelectedDevice()
  const visible = !!device && device.meta.hasCommands !== false

  // Mount the card, then fade + lift it into place. The slight upward
  // translation makes the toolbar feel like it's resting on the
  // viewport floor instead of popping in over it.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!visible) {
      setShown(false)
      return
    }
    const id = window.setTimeout(() => setShown(true), 60)
    return () => window.clearTimeout(id)
  }, [visible, device?.meta.id])

  if (!device || device.meta.hasCommands === false) return null

  const { Toolbar } = device
  return (
    // Card sizes to content — 8 px padding all around the buttons,
    // matching the 8 px gap between them. The asymmetric 24 H / 8 V
    // padding the toolbar shipped with read as "off centre" because
    // the buttons drifted horizontally more than they did vertically.
    <div
      className="flex items-center rounded-[var(--radius-xl)] bg-[var(--bg-default)] p-2"
      style={{
        boxShadow: 'var(--shadow-demo)',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(8px)',
        transition:
          'opacity 220ms cubic-bezier(0.16, 1, 0.3, 1), transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
      }}
    >
      <Toolbar />
    </div>
  )
}

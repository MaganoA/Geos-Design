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
    <div className="grid h-full place-items-center px-5">
      <div
        className="grid h-[68px] min-w-[348px] place-items-center rounded-[var(--radius-xl)] bg-[var(--bg-default)] px-6"
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
    </div>
  )
}

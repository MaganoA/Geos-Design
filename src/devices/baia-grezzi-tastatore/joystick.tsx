import { useCallback, useEffect, useRef, useState } from 'react'
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import { canRunCommand } from '@/lib/role-gate'
import { cn } from '@/lib/cn'
import { commands } from './commands'

type Axis = 'lungo' | 'sinistra' | 'destra'
type Direction = 'avanti' | 'indietro'

const DEVICE_ID = 'baia-grezzi-tastatore'

const AXIS_LABEL: Record<Axis, string> = {
  lungo: 'Lungo',
  sinistra: 'Sinistra',
  destra: 'Destra',
}
const AXES: Axis[] = ['lungo', 'sinistra', 'destra']

/** Jog repeat interval. Mirrors a real industrial pendant's hold-to-move
 *  cadence: fast enough to feel responsive, slow enough that a brief
 *  tap counts as a single nudge. */
const JOG_INTERVAL_MS = 120

/**
 * Three-axis allineatore yoke for the tastatore dock toolbar. Single
 * rounded housing with three labelled cells (Lungo / Sinistra / Destra),
 * each cell a horizontal stem with avanti (▷) and indietro (◁) press
 * zones. Press-and-hold dispatches the matching command at JOG_INTERVAL_MS
 * cadence, matching how an operator on a real machine bumps a linear
 * actuator into position.
 *
 * No live laser values in the housing — the right panel owns those.
 * Repeating them here would tax the operator's eye during the bump.
 */
export function TastatoreJoystick() {
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)

  // Pick any axis-avanti command to gate the whole control. All six
  // share the same role + manualOnly, so one check is enough.
  const probe = commands[0]!
  const disabled =
    !canRunCommand(probe, role) || (probe.manualOnly && mode !== 'manuale')

  return (
    <div
      className={cn(
        'flex h-[52px] items-stretch rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-default)] p-1',
        disabled && 'pointer-events-none opacity-50',
      )}
      aria-label="Joystick allineatori tastatore"
      role="group"
    >
      {AXES.map((axis, i) => (
        <div key={axis} className="flex items-stretch">
          {i > 0 && (
            <span
              aria-hidden
              className="mx-1 w-px self-stretch bg-[var(--border-mute)]"
            />
          )}
          <AxisCell axis={axis} />
        </div>
      ))}
    </div>
  )
}

function AxisCell({ axis }: { axis: Axis }) {
  return (
    <div className="flex items-center gap-1.5">
      <JogButton axis={axis} dir="indietro" />
      <AxisLabel axis={axis} />
      <JogButton axis={axis} dir="avanti" />
    </div>
  )
}

function AxisLabel({ axis }: { axis: Axis }) {
  return (
    <div className="flex w-[68px] flex-col items-center justify-center px-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] leading-none text-[var(--text-muted)]">
        {AXIS_LABEL[axis]}
      </span>
      {/* Stem — the thin track that suggests the linear motion axis the
        cell controls. Sits between the two jog zones visually as well
        as semantically. */}
      <span
        aria-hidden
        className="mt-1.5 h-px w-full bg-[var(--border-default)]"
      />
    </div>
  )
}

function JogButton({ axis, dir }: { axis: Axis; dir: Direction }) {
  const { dispatch } = useCommandDispatch()
  const [pressed, setPressed] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const cmd = commands.find((c) => c.id === `${DEVICE_ID}.${axis}-${dir}`)!

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPressed(false)
  }, [])

  const start = useCallback(() => {
    setPressed(true)
    // First nudge immediately, then jog-repeat on the interval. Matches
    // a real pendant: tap → one bump, hold → continuous motion.
    dispatch(cmd, DEVICE_ID)
    intervalRef.current = window.setInterval(() => {
      dispatch(cmd, DEVICE_ID)
    }, JOG_INTERVAL_MS)
  }, [cmd, dispatch])

  // Clean up if the component unmounts mid-press (toolbar swap, route
  // change). Prevents zombie intervals dispatching commands offscreen.
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  const indietro = dir === 'indietro'

  return (
    <button
      type="button"
      aria-label={`${AXIS_LABEL[axis]} ${indietro ? 'indietro' : 'avanti'}`}
      onPointerDown={(e) => {
        // Capture the pointer so dragging the finger off-button still
        // releases the press when it lifts — important for gloves where
        // the touchdown point drifts as the operator settles their grip.
        e.currentTarget.setPointerCapture(e.pointerId)
        start()
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={(e) => {
        // Only stop on leave when no pointer is captured (mouse hover
        // out without a button press should not affect anything; this
        // mostly matters during a slow drag).
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
      }}
      className={cn(
        'group flex h-10 w-12 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--text-default)]',
        pressed
          ? 'border-transparent bg-[var(--text-default)] text-[var(--bg-default)]'
          : 'border-[var(--border-default)] bg-transparent text-[var(--text-default)] hover:bg-[var(--bg-muted)]',
      )}
    >
      <JogGlyph indietro={indietro} pressed={pressed} />
    </button>
  )
}

/**
 * Triangular jog glyph. Inverts colour with the button, and translates
 * 1 px inward while pressed to simulate the rocker bottoming out — the
 * only motion in the control, kept under 50 ms so it never feels like
 * choreography.
 */
function JogGlyph({
  indietro,
  pressed,
}: {
  indietro: boolean
  pressed: boolean
}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      style={{
        transform: pressed
          ? indietro
            ? 'translateX(1px)'
            : 'translateX(-1px)'
          : 'translateX(0)',
        transition: 'transform 40ms ease-out',
      }}
    >
      {indietro ? (
        <path d="M9.5 2 L4 7 L9.5 12 Z" fill="currentColor" />
      ) : (
        <path d="M4.5 2 L10 7 L4.5 12 Z" fill="currentColor" />
      )}
    </svg>
  )
}

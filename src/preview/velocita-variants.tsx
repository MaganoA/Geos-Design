import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Velocity widget — 5 minimal horizontal alternatives.
 *
 * Each variant is a self-contained component taking the same minimal
 * props (label, value, unit, min, max, optional setpoint). The whole
 * page is rendered against a live-oscillating value so the operator
 * can see how each one behaves under motion (jitter readability,
 * marker tracking, bar smoothness).
 *
 * Open: http://localhost:5173/?preview=velocita-variants
 */

// ─── live-oscillating value (mirrors Speed device tick) ──────────
function useOscillating(center: number, amp: number, periodMs: number) {
  const [v, setV] = useState(center)
  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const phase = ((t - start) / periodMs) * Math.PI * 2
      const jitter = (Math.random() - 0.5) * 6
      setV(center + amp * Math.sin(phase) + jitter)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [center, amp, periodMs])
  return v
}

// ─────────────────────────────────────────────────────────────────
// V1 — Bold number + thin progress bar
// Closest to the reference: large numeric, small unit, thin black
// bar over muted track. "Where I am within range" at a glance.
// ─────────────────────────────────────────────────────────────────
function V1({ label, value, unit, min, max }: VariantProps) {
  const pct = clampPct(value, min, max)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-medium text-stone-900">{label}</span>
        <StatusPill />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[44px] font-semibold leading-none tabular-nums tracking-tight text-stone-900">
          {Math.round(value)}
        </span>
        <span className="text-[14px] font-normal text-stone-500">{unit}</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-stone-900"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// V2 — Linear scale with marker dot + endpoint labels
// Adds explicit min/max so the operator reads "where in the
// nominal envelope". Tick marks at 25/50/75% for extra grounding.
// ─────────────────────────────────────────────────────────────────
function V2({ label, value, unit, min, max }: VariantProps) {
  const pct = clampPct(value, min, max)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-medium text-stone-900">{label}</span>
        <StatusPill />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[44px] font-semibold leading-none tabular-nums tracking-tight text-stone-900">
          {Math.round(value)}
        </span>
        <span className="text-[14px] font-normal text-stone-500">{unit}</span>
      </div>
      <div className="pt-1">
        <div className="relative h-[2px] w-full bg-stone-200">
          {[25, 50, 75].map((p) => (
            <span
              key={p}
              className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-stone-300"
              style={{ left: `${p}%` }}
            />
          ))}
          <span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-stone-900 bg-white"
            style={{ left: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] tabular-nums text-stone-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// V3 — Segmented industrial bar
// Twelve discrete cells, filled left-to-right. Reads as a chunky
// HMI step indicator — clear quanta the operator can count at
// distance.
// ─────────────────────────────────────────────────────────────────
function V3({ label, value, unit, min, max }: VariantProps) {
  const segments = 12
  const pct = clampPct(value, min, max)
  const filled = Math.round((pct / 100) * segments)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-medium text-stone-900">{label}</span>
        <StatusPill />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[44px] font-semibold leading-none tabular-nums tracking-tight text-stone-900">
          {Math.round(value)}
        </span>
        <span className="text-[14px] font-normal text-stone-500">{unit}</span>
      </div>
      <div className="grid h-2.5 w-full grid-cols-12 gap-[3px]">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'rounded-[2px]',
              i < filled ? 'bg-stone-900' : 'bg-stone-200',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// V4 — Setpoint deviation bar
// Centerline marks the nominal setpoint; the bar fills from centre
// outward in the direction of the deviation. Best for "is this
// running on spec?" reading — Δ from target is the data, not the
// absolute value.
// ─────────────────────────────────────────────────────────────────
function V4({ label, value, unit, min, max, setpoint }: VariantProps) {
  const sp = setpoint ?? (min + max) / 2
  const half = Math.max(max - sp, sp - min)
  const delta = value - sp
  const halfFillPct = Math.max(
    0,
    Math.min(50, (Math.abs(delta) / half) * 50),
  )
  const sign = delta >= 0 ? 1 : -1
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-medium text-stone-900">{label}</span>
        <StatusPill />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[44px] font-semibold leading-none tabular-nums tracking-tight text-stone-900">
            {Math.round(value)}
          </span>
          <span className="text-[14px] font-normal text-stone-500">{unit}</span>
        </div>
        <span className="text-[12px] tabular-nums text-stone-500">
          {delta >= 0 ? '+' : '−'}
          {Math.round(Math.abs(delta))} vs {sp}
        </span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-stone-200">
        {/* setpoint centerline */}
        <span className="absolute left-1/2 top-[-3px] h-[14px] w-px -translate-x-1/2 bg-stone-400" />
        {/* deviation fill: half-bar from centre outward */}
        <div
          className="absolute inset-y-0 rounded-full bg-stone-900"
          style={{
            left: sign > 0 ? '50%' : `${50 - halfFillPct}%`,
            width: `${halfFillPct}%`,
          }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// V5 — Pure number + trend chevron
// No bar. Just the value and a tiny chevron + delta showing direction
// over the last second. Maximum minimalism — for surfaces where the
// number is the data and "running normally" is the implied state.
// ─────────────────────────────────────────────────────────────────
function V5({ label, value, unit }: VariantProps) {
  // Trend: sample value 1s apart in a ref-like state.
  const [prev, setPrev] = useState({ v: value, lastValue: value })
  if (prev.lastValue !== value) {
    // Adopt the new lastValue but only update `v` if motion is
    // significant; jitter under ±1 mm/s reads as flat.
    const significant = Math.abs(value - prev.v) >= 1.5
    setPrev({ v: significant ? value : prev.v, lastValue: value })
  }
  const delta = value - prev.v
  const dir = Math.abs(delta) < 1.5 ? 'flat' : delta > 0 ? 'up' : 'down'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-medium text-stone-900">{label}</span>
        <StatusPill />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[44px] font-semibold leading-none tabular-nums tracking-tight text-stone-900">
            {Math.round(value)}
          </span>
          <span className="text-[14px] font-normal text-stone-500">{unit}</span>
        </div>
        <span className="mb-1 inline-flex items-center gap-1 text-[12px] tabular-nums text-stone-500">
          <TrendChevron dir={dir} />
          {dir === 'flat'
            ? 'stabile'
            : `${delta > 0 ? '+' : '−'}${Math.round(Math.abs(delta))}`}
        </span>
      </div>
    </div>
  )
}

// ─── helpers ─────────────────────────────────────────────────────
interface VariantProps {
  label: string
  value: number
  unit: string
  min: number
  max: number
  setpoint?: number
}

function clampPct(v: number, min: number, max: number) {
  if (max === min) return 0
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))
}

function StatusPill() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-stone-500">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Attivo
    </span>
  )
}

function TrendChevron({ dir }: { dir: 'up' | 'down' | 'flat' }) {
  if (dir === 'flat') {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
        <path d="M2 5 L8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  const rot = dir === 'up' ? 0 : 180
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <path
        d="M2 6.5 L5 3 L8 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// ─── page ────────────────────────────────────────────────────────
const VARIANTS = [
  { key: 'V1', name: 'Bar + numero', tagline: 'Riferimento. Bar lineare classico, posizione in range.', C: V1 },
  { key: 'V2', name: 'Scala + marker dot', tagline: 'Min/max espliciti, tick a 25/50/75. Più contesto.', C: V2 },
  { key: 'V3', name: 'Segmented industrial', tagline: '12 celle discrete. Step-indicator HMI, contabili a distanza.', C: V3 },
  { key: 'V4', name: 'Deviation da setpoint', tagline: 'Centerline = setpoint. Riempie verso lo scostamento. Δ è il dato.', C: V4 },
  { key: 'V5', name: 'Numero + trend chevron', tagline: 'Niente bar. Solo valore e direzione. Minimalismo estremo.', C: V5 },
]

export function VelocitaVariants() {
  const value = useOscillating(248, 35, 4000)
  const min = 0
  const max = 500
  const setpoint = 250

  return (
    <div className="min-h-screen w-full bg-stone-100 p-10">
      <header className="mx-auto mb-8 max-w-6xl">
        <h1 className="text-[24px] font-semibold tracking-tight text-stone-900">
          Velocità relazionale — 5 alternative
        </h1>
        <p className="mt-2 text-[14px] text-stone-500">
          Stesso valore live oscillante ({min}–{max} mm/s, setpoint {setpoint}) in tutte
          le card. Pick one, poi lo cabliamo nel pannello Speed.
        </p>
      </header>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {VARIANTS.map(({ key, name, tagline, C }) => (
          <section
            key={key}
            className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.06)] ring-1 ring-stone-200/60"
          >
            <header className="mb-5 flex items-baseline gap-3">
              <span className="text-[11px] font-semibold tabular-nums tracking-wider text-stone-400">
                {key}
              </span>
              <span className="text-[14px] font-medium text-stone-900">
                {name}
              </span>
            </header>
            <C
              label="Velocità"
              value={value}
              unit="mm/s"
              min={min}
              max={max}
              setpoint={setpoint}
            />
            <footer className="mt-6 border-t border-stone-100 pt-4 text-[12px] leading-relaxed text-stone-500">
              {tagline}
            </footer>
          </section>
        ))}
      </main>
    </div>
  )
}

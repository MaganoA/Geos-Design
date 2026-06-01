import { useEffect, useState } from 'react'
import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { Text } from '@/components/primitives/text'
import { cn } from '@/lib/cn'

/**
 * Velocity widget — 5 minimal horizontal alternatives.
 *
 * Each variant is shown twice per row:
 *   - LEFT  → isolated white card (same chrome we'd ship in a marketing
 *             screenshot; useful to evaluate the widget itself).
 *   - RIGHT → in-context render: dropped into the actual Speed panel
 *             DataSection ("Macchinario"), at the right-panel width
 *             (368 px from app.tsx) with Data/ora above it. This is
 *             what the operator will actually see.
 *
 * `dense` switches the variant to its in-context typography (smaller
 * numerals, no status pill — the panel header already carries status).
 *
 * Live value oscillates at ~5 Hz (matches the production tick) so the
 * comparison happens under motion.
 *
 * Open: http://localhost:5173/?preview=velocita-variants
 */

// ─── live-oscillating value (mirrors Speed device tick) ──────────
const TICK_MS = 200
const JITTER_AMP = 1
function useOscillating(center: number, amp: number, periodMs: number) {
  const [v, setV] = useState(center)
  useEffect(() => {
    const start = performance.now()
    const id = setInterval(() => {
      const t = performance.now() - start
      const phase = (t / periodMs) * Math.PI * 2
      const jitter = (Math.random() - 0.5) * 2 * JITTER_AMP
      setV(center + amp * Math.sin(phase) + jitter)
    }, TICK_MS)
    return () => clearInterval(id)
  }, [center, amp, periodMs])
  return v
}

// ─── shared bits ─────────────────────────────────────────────────
interface VariantProps {
  label: string
  value: number
  unit: string
  min: number
  max: number
  setpoint?: number
  /**
   * In-context mode for placement inside the production DataSection:
   *  - smaller numerals (the row sits next to compact DataRow rows)
   *  - no status pill (panel header already carries the badge)
   */
  dense?: boolean
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

// Label + status row (suppressed in `dense` mode).
function Header({ label, dense }: { label: string; dense?: boolean }) {
  return dense ? (
    <Text variant="sm/normal" className="text-[var(--text-muted)]">
      {label}
    </Text>
  ) : (
    <div className="flex items-baseline justify-between">
      <span className="text-[15px] font-medium text-stone-900">{label}</span>
      <StatusPill />
    </div>
  )
}

// Number + unit, in two scales.
function ValueLine({
  value,
  unit,
  dense,
  trailing,
}: {
  value: number
  unit: string
  dense?: boolean
  trailing?: React.ReactNode
}) {
  const valueClass = dense
    ? 'text-[28px] font-semibold leading-none tabular-nums tracking-tight text-stone-900'
    : 'text-[44px] font-semibold leading-none tabular-nums tracking-tight text-stone-900'
  const unitClass = dense
    ? 'text-[13px] font-normal text-stone-500'
    : 'text-[14px] font-normal text-stone-500'
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-1.5">
        <span className={valueClass}>{Math.round(value)}</span>
        <span className={unitClass}>{unit}</span>
      </div>
      {trailing}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// V1 — Bold number + thin progress bar
// ─────────────────────────────────────────────────────────────────
function V1({ label, value, unit, min, max, dense }: VariantProps) {
  const pct = clampPct(value, min, max)
  return (
    <div className={cn('flex flex-col', dense ? 'gap-2 py-1.5' : 'gap-3')}>
      <Header label={label} dense={dense} />
      <ValueLine value={value} unit={unit} dense={dense} />
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-stone-200',
          dense ? 'h-1' : 'h-1.5',
        )}
      >
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
// ─────────────────────────────────────────────────────────────────
function V2({ label, value, unit, min, max, dense }: VariantProps) {
  const pct = clampPct(value, min, max)
  return (
    <div className={cn('flex flex-col', dense ? 'gap-2 py-1.5' : 'gap-3')}>
      <Header label={label} dense={dense} />
      <ValueLine value={value} unit={unit} dense={dense} />
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
            className={cn(
              'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-stone-900 bg-white',
              dense ? 'h-3 w-3 border-[2px]' : 'h-3.5 w-3.5 border-[2.5px]',
            )}
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
// ─────────────────────────────────────────────────────────────────
function V3({ label, value, unit, min, max, dense }: VariantProps) {
  const segments = 12
  const pct = clampPct(value, min, max)
  const filled = Math.round((pct / 100) * segments)
  return (
    <div className={cn('flex flex-col', dense ? 'gap-2 py-1.5' : 'gap-3')}>
      <Header label={label} dense={dense} />
      <ValueLine value={value} unit={unit} dense={dense} />
      <div
        className={cn(
          'grid w-full grid-cols-12 gap-[3px]',
          dense ? 'h-2' : 'h-2.5',
        )}
      >
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
// ─────────────────────────────────────────────────────────────────
function V4({ label, value, unit, min, max, setpoint, dense }: VariantProps) {
  const sp = setpoint ?? (min + max) / 2
  const half = Math.max(max - sp, sp - min)
  const delta = value - sp
  const halfFillPct = Math.max(
    0,
    Math.min(50, (Math.abs(delta) / half) * 50),
  )
  const sign = delta >= 0 ? 1 : -1
  const trailing = (
    <span className="text-[12px] tabular-nums text-stone-500">
      {delta >= 0 ? '+' : '−'}
      {Math.round(Math.abs(delta))} vs {sp}
    </span>
  )
  return (
    <div className={cn('flex flex-col', dense ? 'gap-2 py-1.5' : 'gap-3')}>
      <Header label={label} dense={dense} />
      <ValueLine value={value} unit={unit} dense={dense} trailing={trailing} />
      <div
        className={cn(
          'relative w-full rounded-full bg-stone-200',
          dense ? 'h-1' : 'h-1.5',
        )}
      >
        <span
          className={cn(
            'absolute left-1/2 w-px -translate-x-1/2 bg-stone-400',
            dense ? 'top-[-3px] h-[10px]' : 'top-[-3px] h-[14px]',
          )}
        />
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
// ─────────────────────────────────────────────────────────────────
function V5({ label, value, unit, dense }: VariantProps) {
  const [prev, setPrev] = useState({ v: value, lastValue: value })
  if (prev.lastValue !== value) {
    const significant = Math.abs(value - prev.v) >= 1.5
    setPrev({ v: significant ? value : prev.v, lastValue: value })
  }
  const delta = value - prev.v
  const dir = Math.abs(delta) < 1.5 ? 'flat' : delta > 0 ? 'up' : 'down'
  const trailing = (
    <span className="mb-1 inline-flex items-center gap-1 text-[12px] tabular-nums text-stone-500">
      <TrendChevron dir={dir} />
      {dir === 'flat'
        ? 'stabile'
        : `${delta > 0 ? '+' : '−'}${Math.round(Math.abs(delta))}`}
    </span>
  )
  return (
    <div className={cn('flex flex-col', dense ? 'gap-2 py-1.5' : 'gap-3')}>
      <Header label={label} dense={dense} />
      <ValueLine value={value} unit={unit} dense={dense} trailing={trailing} />
    </div>
  )
}

// ─── in-context wrapper: right-panel chrome at production width ───
// 368 px = RIGHT_PANEL_WIDTH from app.tsx. Inside it, a DataSection
// reproducing the Speed panel's "Macchinario" group.
function PanelContext({
  children,
  dataOra,
}: {
  children: React.ReactNode
  dataOra: string
}) {
  return (
    <div className="w-[368px] rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-stone-200/70">
      <DataSection title="Macchinario">
        <DataRow label="Data/ora" value={dataOra} />
        {children}
      </DataSection>
    </div>
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

function useClock() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return t.toLocaleTimeString('it-IT', { hour12: false })
}

export function VelocitaVariants() {
  const value = useOscillating(248, 35, 4000)
  const dataOra = useClock()
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
          Stesso valore live oscillante ({min}–{max} mm/s, setpoint {setpoint}) in
          tutte le card. A sinistra il widget isolato, a destra dentro la
          DataSection "Macchinario" del pannello Speed alla larghezza reale (368 px).
        </p>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10">
        {VARIANTS.map(({ key, name, tagline, C }) => (
          <section key={key}>
            <header className="mb-4 flex items-baseline gap-3">
              <span className="text-[11px] font-semibold tabular-nums tracking-wider text-stone-400">
                {key}
              </span>
              <span className="text-[14px] font-medium text-stone-900">
                {name}
              </span>
              <span className="text-[12px] text-stone-500">— {tagline}</span>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
              {/* LEFT — isolated card */}
              <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.06)] ring-1 ring-stone-200/60">
                <header className="mb-4 text-[11px] uppercase tracking-wider text-stone-400">
                  Isolato
                </header>
                <C
                  label="Velocità"
                  value={value}
                  unit="mm/s"
                  min={min}
                  max={max}
                  setpoint={setpoint}
                />
              </div>

              {/* RIGHT — in-context (production right-panel chrome) */}
              <div>
                <header className="mb-4 text-[11px] uppercase tracking-wider text-stone-400">
                  In contesto — pannello Speed
                </header>
                <PanelContext dataOra={dataOra}>
                  <C
                    label="Velocità relazionale"
                    value={value}
                    unit="mm/s"
                    min={min}
                    max={max}
                    setpoint={setpoint}
                    dense
                  />
                </PanelContext>
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

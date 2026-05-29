import { useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Mode toolbar — 10 variants. Each is a genuinely different
 * combination of (shape × state-cue × colour strategy). All sit
 * inside the production white BottomToolbar card; no dark panels.
 * Open: http://localhost:5173/?preview=toolbar-variants
 */

type Mode = 'operativa' | 'riposo-1' | 'riposo-2'

const RIPOSO_NUMS: Array<{ num: '1' | '2'; mode: Mode; label: string; sub: string }> = [
  { num: '1', mode: 'riposo-1', label: 'Riposo 1', sub: 'Fuori ingombro 1' },
  { num: '2', mode: 'riposo-2', label: 'Riposo 2', sub: 'Fuori ingombro 2' },
]

const PauseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <rect x="4" y="3" width="3" height="10" rx="0.5" fill="currentColor" />
    <rect x="9" y="3" width="3" height="10" rx="0.5" fill="currentColor" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <path
      d="M3.5 8.5L6.5 11.5L12.5 5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

// ───────────────────────────────────────────────────────────────────────────
// V1 — Outline → solid charcoal fill
// ───────────────────────────────────────────────────────────────────────────

function V1() {
  const [mode, setMode] = useState<Mode>('operativa')
  return (
    <ToolbarShell label="1 — Outline → solid fill (charcoal)">
      <WhiteCard>
        {RIPOSO_NUMS.map((r) => {
          const active = mode === r.mode
          return (
            <button
              key={r.num}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setMode(active ? 'operativa' : r.mode)}
              className={cn(
                'group flex h-[60px] w-[220px] items-center gap-3 rounded-[var(--radius-md)] px-4 text-left transition-all active:scale-[0.985]',
                active ? 'bg-[var(--text-default)]' : 'bg-[var(--bg-default)] hover:bg-[var(--bg-muted)]',
              )}
              style={active ? undefined : { boxShadow: 'inset 0 0 0 1px var(--border-default)' }}
            >
              <span className={cn('grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] font-mono text-base font-medium', active ? 'bg-amber-400 text-stone-900' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]')}>{r.num}</span>
              <span className="flex flex-col">
                <span className={cn('text-[14px] font-medium leading-tight', active ? 'text-white' : 'text-[var(--text-default)]')}>{r.label}</span>
                <span className={cn('text-[11px] leading-tight', active ? 'text-stone-300' : 'text-[var(--text-muted)]')}>{r.sub}</span>
              </span>
            </button>
          )
        })}
      </WhiteCard>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V2 — Embossed key + emerald LED
// ───────────────────────────────────────────────────────────────────────────

function V2() {
  const [mode, setMode] = useState<Mode>('operativa')
  return (
    <ToolbarShell label="2 — Embossed key + emerald LED">
      <WhiteCard>
        {RIPOSO_NUMS.map((r) => {
          const active = mode === r.mode
          return (
            <button
              key={r.num}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setMode(active ? 'operativa' : r.mode)}
              className="relative grid h-[60px] w-[220px] grid-cols-[40px_1fr_8px] items-center gap-3 rounded-[var(--radius-md)] px-4 transition-all active:translate-y-px"
              style={active ? {
                background: 'linear-gradient(180deg, rgb(255 255 255) 0%, rgb(250 250 249) 100%)',
                boxShadow: '0 0 0 1px rgb(34 197 94 / 0.35), 0 0 0 4px rgb(34 197 94 / 0.10), inset 0 1px 0 rgb(255 255 255 / 0.9)',
              } : {
                background: 'linear-gradient(180deg, rgb(255 255 255) 0%, rgb(250 250 249) 100%)',
                boxShadow: '0 0 0 1px var(--border-mute), 0 1px 2px rgb(39 39 42 / 0.05), inset 0 1px 0 rgb(255 255 255 / 0.9)',
              }}
            >
              <span className={cn('grid h-9 w-9 place-items-center rounded-full font-mono text-base font-medium', active ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]')}>{r.num}</span>
              <span className="flex flex-col text-left">
                <span className="text-[14px] font-medium leading-tight text-[var(--text-default)]">{r.label}</span>
                <span className="text-[11px] leading-tight text-[var(--text-muted)]">{r.sub}</span>
              </span>
              <span aria-hidden className={cn('h-2 w-2 justify-self-end rounded-full', active ? 'bg-emerald-500' : 'bg-stone-300')} style={active ? { boxShadow: '0 0 8px rgb(34 197 94 / 0.7)' } : undefined} />
            </button>
          )
        })}
      </WhiteCard>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V3 — Backlit pill (amber lit-from-within)
// ───────────────────────────────────────────────────────────────────────────

function V3() {
  const [mode, setMode] = useState<Mode>('operativa')
  return (
    <ToolbarShell label="3 — Backlit pill (amber, lit from within)">
      <WhiteCard>
        {RIPOSO_NUMS.map((r) => {
          const active = mode === r.mode
          return (
            <button
              key={r.num}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setMode(active ? 'operativa' : r.mode)}
              className="relative flex h-[60px] w-[220px] items-center gap-3 rounded-full px-5 text-left transition-all active:scale-[0.985]"
              style={active ? {
                background: 'linear-gradient(180deg, rgb(255 251 235) 0%, rgb(254 243 199) 100%)',
                boxShadow: 'inset 0 0 0 1px rgb(252 211 77), inset 0 0 18px rgb(245 158 11 / 0.25)',
              } : {
                background: 'var(--bg-default)',
                boxShadow: 'inset 0 0 0 1px var(--border-default)',
              }}
            >
              <span className={cn('grid h-8 w-8 place-items-center rounded-full font-mono text-sm font-medium', active ? 'bg-amber-500 text-white' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]')}>{r.num}</span>
              <span className="flex flex-col">
                <span className={cn('text-[14px] font-medium leading-tight', active ? 'text-amber-900' : 'text-[var(--text-default)]')}>{r.label}</span>
                <span className={cn('text-[11px] leading-tight', active ? 'text-amber-700' : 'text-[var(--text-muted)]')}>{r.sub}</span>
              </span>
            </button>
          )
        })}
      </WhiteCard>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V4 — 3-position segmented control (sliding white pill)
// ───────────────────────────────────────────────────────────────────────────

function V4() {
  const [mode, setMode] = useState<Mode>('operativa')
  const modes: Array<{ id: Mode; label: string }> = [
    { id: 'operativa', label: 'Operativa' },
    { id: 'riposo-1', label: 'Riposo 1' },
    { id: 'riposo-2', label: 'Riposo 2' },
  ]
  return (
    <ToolbarShell label="4 — 3-position segmented (Operativa visible)">
      <div className="rounded-[var(--radius-xl)] bg-[var(--bg-default)] p-3" style={{ boxShadow: 'var(--shadow-demo)' }}>
        <div className="flex h-[60px] gap-1 rounded-full bg-[var(--bg-muted)] p-1.5">
          {modes.map((m) => {
            const active = mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMode(m.id)}
                className={cn(
                  'h-full min-w-[140px] rounded-full px-6 text-sm font-medium transition-colors',
                  active ? 'bg-[var(--bg-default)] text-[var(--text-default)]' : 'text-[var(--text-muted)] hover:text-[var(--text-default)]',
                )}
                style={active ? { boxShadow: 'var(--shadow-base)' } : undefined}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V5 — Filter chip toggles with check icon
// ───────────────────────────────────────────────────────────────────────────

function V5() {
  const [mode, setMode] = useState<Mode>('operativa')
  return (
    <ToolbarShell label="5 — Filter chips with check">
      <WhiteCard>
        {RIPOSO_NUMS.map((r) => {
          const active = mode === r.mode
          return (
            <button
              key={r.num}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setMode(active ? 'operativa' : r.mode)}
              className={cn(
                'flex h-[60px] w-[180px] items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all active:scale-[0.985]',
                active ? 'bg-[var(--text-default)] text-white' : 'bg-[var(--bg-default)] text-[var(--text-default)] hover:bg-[var(--bg-muted)]',
              )}
              style={active ? undefined : { boxShadow: 'inset 0 0 0 1px var(--border-default)' }}
            >
              <CheckIcon className={cn('h-4 w-4 transition-opacity', active ? 'opacity-100' : 'opacity-0')} />
              {r.label}
            </button>
          )
        })}
      </WhiteCard>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V6 — Capsule with state tag (Riposo 1 [● ATTIVO])
// ───────────────────────────────────────────────────────────────────────────

function V6() {
  const [mode, setMode] = useState<Mode>('operativa')
  return (
    <ToolbarShell label="6 — Capsule with explicit state tag">
      <WhiteCard>
        {RIPOSO_NUMS.map((r) => {
          const active = mode === r.mode
          return (
            <button
              key={r.num}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setMode(active ? 'operativa' : r.mode)}
              className="flex h-[60px] w-[240px] items-center justify-between rounded-full bg-[var(--bg-default)] px-4 text-left transition-all active:scale-[0.985] hover:bg-[var(--bg-muted)]"
              style={{ boxShadow: 'inset 0 0 0 1px var(--border-default)' }}
            >
              <span className="text-[14px] font-medium text-[var(--text-default)]">{r.label}</span>
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase transition-colors',
                active ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]',
              )}>
                <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-stone-400')} />
                {active ? 'Attivo' : 'Off'}
              </span>
            </button>
          )
        })}
      </WhiteCard>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V7 — Pause-icon led button
// ───────────────────────────────────────────────────────────────────────────

function V7() {
  const [mode, setMode] = useState<Mode>('operativa')
  return (
    <ToolbarShell label="7 — Pause icon, no number">
      <WhiteCard>
        {RIPOSO_NUMS.map((r) => {
          const active = mode === r.mode
          return (
            <button
              key={r.num}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setMode(active ? 'operativa' : r.mode)}
              className={cn(
                'flex h-[60px] w-[200px] items-center gap-3 rounded-[var(--radius-lg)] px-4 text-left transition-all active:scale-[0.985]',
                active ? 'bg-amber-50' : 'bg-[var(--bg-default)] hover:bg-[var(--bg-muted)]',
              )}
              style={{ boxShadow: active ? 'inset 0 0 0 1px rgb(252 211 77)' : 'inset 0 0 0 1px var(--border-default)' }}
            >
              <PauseIcon className={cn('h-5 w-5 transition-colors', active ? 'text-amber-600' : 'text-[var(--text-muted)]')} />
              <span className="flex flex-col">
                <span className={cn('text-[14px] font-medium leading-tight', active ? 'text-amber-900' : 'text-[var(--text-default)]')}>{r.label}</span>
                <span className={cn('text-[11px] leading-tight', active ? 'text-amber-700' : 'text-[var(--text-muted)]')}>{r.sub}</span>
              </span>
            </button>
          )
        })}
      </WhiteCard>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V8 — Settings-row layout: label left, state dot right
// ───────────────────────────────────────────────────────────────────────────

function V8() {
  const [mode, setMode] = useState<Mode>('operativa')
  return (
    <ToolbarShell label="8 — Settings-row toggle">
      <div className="flex w-[420px] flex-col rounded-[var(--radius-xl)] bg-[var(--bg-default)] py-1.5" style={{ boxShadow: 'var(--shadow-demo)' }}>
        {RIPOSO_NUMS.map((r, i) => {
          const active = mode === r.mode
          return (
            <button
              key={r.num}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setMode(active ? 'operativa' : r.mode)}
              className={cn(
                'flex h-[52px] items-center justify-between gap-4 px-5 text-left transition-colors',
                i === 1 && 'border-t border-[var(--border-mute)]',
                active ? 'bg-[var(--bg-muted)]' : 'hover:bg-[var(--bg-muted)]',
              )}
            >
              <span className="flex flex-col">
                <span className="text-[14px] font-medium leading-tight text-[var(--text-default)]">{r.label}</span>
                <span className="text-[11px] leading-tight text-[var(--text-muted)]">{r.sub}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className={cn('text-[11px] font-medium tracking-wider uppercase transition-colors', active ? 'text-emerald-700' : 'text-[var(--text-muted)]')}>
                  {active ? 'Attivo' : 'Off'}
                </span>
                <span aria-hidden className={cn('h-2 w-2 rounded-full', active ? 'bg-emerald-500' : 'bg-stone-300')} style={active ? { boxShadow: '0 0 6px rgb(34 197 94 / 0.6)' } : undefined} />
              </span>
            </button>
          )
        })}
      </div>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V9 — Big numbered tile (number-led, label below)
// ───────────────────────────────────────────────────────────────────────────

function V9() {
  const [mode, setMode] = useState<Mode>('operativa')
  return (
    <ToolbarShell label="9 — Big numbered tile">
      <WhiteCard>
        {RIPOSO_NUMS.map((r) => {
          const active = mode === r.mode
          return (
            <button
              key={r.num}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setMode(active ? 'operativa' : r.mode)}
              className={cn(
                'group flex h-[76px] w-[140px] flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] transition-all active:scale-[0.985]',
                active ? 'bg-stone-900 text-white' : 'bg-[var(--bg-default)] text-[var(--text-default)] hover:bg-[var(--bg-muted)]',
              )}
              style={active ? undefined : { boxShadow: 'inset 0 0 0 1px var(--border-default)' }}
            >
              <span className={cn('font-mono text-[26px] leading-none font-medium tabular-nums transition-colors', active ? 'text-amber-300' : 'text-[var(--text-default)]')}>{r.num}</span>
              <span className={cn('text-[11px] font-medium tracking-[0.143em] uppercase transition-colors', active ? 'text-stone-300' : 'text-[var(--text-muted)]')}>Riposo</span>
            </button>
          )
        })}
      </WhiteCard>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// V10 — Current-mode header + action buttons
// ───────────────────────────────────────────────────────────────────────────

function V10() {
  const [mode, setMode] = useState<Mode>('operativa')
  const currentLabel = mode === 'operativa' ? 'Operativa' : mode === 'riposo-1' ? 'Riposo 1' : 'Riposo 2'
  const isParked = mode !== 'operativa'
  return (
    <ToolbarShell label="10 — Current-mode header + actions">
      <div className="flex w-[460px] flex-col gap-2 rounded-[var(--radius-xl)] bg-[var(--bg-default)] px-3 pt-2 pb-3" style={{ boxShadow: 'var(--shadow-demo)' }}>
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[10px] font-medium tracking-[0.18em] text-[var(--text-muted)] uppercase">Modalità</span>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
            <span className={cn('h-1.5 w-1.5 rounded-full', isParked ? 'bg-amber-500' : 'bg-emerald-500')} style={{ boxShadow: isParked ? '0 0 6px rgb(245 158 11 / 0.6)' : '0 0 6px rgb(34 197 94 / 0.6)' }} />
            <span className={cn(isParked ? 'text-amber-700' : 'text-emerald-700')}>{currentLabel}</span>
          </span>
        </div>
        <div className="flex gap-2">
          {RIPOSO_NUMS.map((r) => {
            const active = mode === r.mode
            return (
              <button
                key={r.num}
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => setMode(active ? 'operativa' : r.mode)}
                className={cn(
                  'flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] text-[14px] font-medium transition-all active:scale-[0.985]',
                  active ? 'bg-[var(--text-default)] text-white' : 'bg-[var(--bg-muted)] text-[var(--text-default)] hover:bg-stone-200',
                )}
              >
                <span className={cn('font-mono text-base font-medium tabular-nums', active ? 'text-amber-300' : 'text-[var(--text-muted)]')}>{r.num}</span>
                {r.label}
              </button>
            )
          })}
        </div>
      </div>
    </ToolbarShell>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Shared shells
// ───────────────────────────────────────────────────────────────────────────

function WhiteCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-[var(--radius-xl)] bg-[var(--bg-default)] p-3"
      style={{ boxShadow: 'var(--shadow-demo)' }}
    >
      {children}
    </div>
  )
}

function ToolbarShell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col items-center gap-3">
      <span className="text-xs font-medium tracking-[0.143em] text-[var(--text-muted)] uppercase">
        {label}
      </span>
      <div className="flex min-h-[110px] items-center justify-center">
        {children}
      </div>
    </section>
  )
}

export function ToolbarVariants() {
  return (
    <div className="min-h-dvh bg-[var(--bg-muted)] px-8 py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-medium tracking-[0.143em] text-[var(--text-muted)] uppercase">
            Preview · iterazione 5 · 10 varianti
          </span>
          <h1 className="text-3xl font-medium leading-9 tracking-[-0.033em]">
            Modalità Testa 1
          </h1>
          <p className="max-w-[60ch] text-sm text-[var(--text-muted)]">
            Ten distinct directions: each varies shape, state cue, or
            colour strategy. All sit on the production white card.
            Click a button to see its active state. Tell me which number(s).
          </p>
        </header>
        <V1 />
        <V2 />
        <V3 />
        <V4 />
        <V5 />
        <V6 />
        <V7 />
        <V8 />
        <V9 />
        <V10 />
      </div>
    </div>
  )
}

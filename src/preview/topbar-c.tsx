import { useState } from 'react'
import ArrowUp from '@/icons/arrow-up.svg?react'
import ArrowDown from '@/icons/arrow-down.svg?react'
import { TopBar } from '@/shell/top-bar'
import { TopBarPreviewShell, PREVIEW_HOP } from './topbar-shell'

const STATUS = [
  { label: 'Ricetta', color: 'var(--status-active)' },
  { label: 'Robot', color: 'var(--status-active)' },
  { label: 'Testa 1', color: 'var(--status-active)' },
  { label: 'Testa 2', color: 'var(--status-warning)' },
  { label: 'Speed', color: 'var(--status-active)' },
]

// The chip stack in full mode places the title at exactly y=48 from the
// topbar top: chip has py-5 (20px) + label line (16px) + gap-3 (12px) = 48.
// The mini-strip uses the same Y offset so the recipe text doesn't jump
// when toggling between full and mini.
const TITLE_Y_OFFSET = 48
const TITLE_LINE_HEIGHT = 24
const MINI_HEIGHT = TITLE_Y_OFFSET + TITLE_LINE_HEIGHT + 16 // 88px

export function TopBarVariantC() {
  const [mini, setMini] = useState(false)
  return (
    <TopBarPreviewShell
      variantLabel="C · Mini-strip (two modes, status always visible)"
      hop={PREVIEW_HOP}
      topBarRowHeight={mini ? MINI_HEIGHT : 124}
      topBarSlot={
        mini ? <MiniStrip onExpand={() => setMini(false)} /> : <FullBar onMini={() => setMini(true)} />
      }
    />
  )
}

function FullBar({ onMini }: { onMini: () => void }) {
  return (
    <div className="relative h-full border-b border-[var(--border-mute)] bg-[var(--bg-default)]">
      <TopBar />
      <button
        type="button"
        onClick={onMini}
        aria-label="Comprimi a barra ridotta"
        className="absolute right-4 grid h-9 w-9 place-items-center rounded text-[var(--icon-default-subtle)] hover:bg-[var(--bg-muted)] hover:text-[var(--icon-default)]"
        style={{ top: TITLE_Y_OFFSET - 6 }}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  )
}

function MiniStrip({ onExpand }: { onExpand: () => void }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label="Espandi pannello superiore"
      className="group relative h-full w-full border-b border-[var(--border-mute)] bg-[var(--bg-default)] text-left transition-colors hover:bg-[var(--bg-muted)]"
    >
      <span
        className="absolute left-6 text-base font-medium leading-snug text-[var(--text-default)]"
        style={{ top: TITLE_Y_OFFSET }}
      >
        Lastra 1500x450x6 Gress Rosso
      </span>
      <div
        className="absolute right-6 flex items-center gap-6"
        style={{ top: TITLE_Y_OFFSET + 4 }}
      >
        <div className="flex items-center gap-2.5">
          {STATUS.map((s) => (
            <span
              key={s.label}
              className="block h-1.5 w-1.5 rounded-full"
              style={{ background: s.color }}
              aria-label={s.label}
            />
          ))}
        </div>
        <ArrowDown className="h-4 w-4 text-[var(--icon-default-subtle)] transition-transform group-hover:translate-y-0.5" />
      </div>
    </button>
  )
}

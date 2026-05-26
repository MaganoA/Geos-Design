import { useState } from 'react'
import XIcon from '@/icons/x.svg?react'
import { TopBar } from '@/shell/top-bar'
import { TopBarPreviewShell, PREVIEW_HOP } from './topbar-shell'

const STATUS_DOTS: Array<{ label: string; status: 'active' | 'warning' | 'error' | 'idle' }> = [
  { label: 'Ricetta', status: 'active' },
  { label: 'Robot', status: 'active' },
  { label: 'Testa 1', status: 'active' },
  { label: 'Testa 2', status: 'warning' },
  { label: 'Speed', status: 'active' },
]

const STATUS_COLOR: Record<typeof STATUS_DOTS[number]['status'], string> = {
  active: 'var(--status-active)',
  warning: 'var(--status-warning)',
  error: 'var(--status-error)',
  idle: 'var(--status-idle)',
}

export function TopBarVariantA() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <TopBarPreviewShell
      variantLabel="A · Status dots (flush, status always visible)"
      hop={PREVIEW_HOP}
      topBarRowHeight={collapsed ? 14 : 124}
      topBarSlot={
        collapsed ? <StatusStrip onExpand={() => setCollapsed(false)} /> : <FullBar onCollapse={() => setCollapsed(true)} />
      }
    />
  )
}

function FullBar({ onCollapse }: { onCollapse: () => void }) {
  return (
    <div className="relative h-full border-b border-[var(--border-mute)] bg-[var(--bg-default)]">
      <TopBar />
      <button
        type="button"
        onClick={onCollapse}
        aria-label="Nascondi pannello superiore"
        className="absolute right-4 top-3 grid h-9 w-9 place-items-center rounded text-[var(--icon-default-subtle)] hover:bg-[var(--bg-muted)] hover:text-[var(--icon-default)]"
      >
        <XIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

function StatusStrip({ onExpand }: { onExpand: () => void }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label="Mostra pannello superiore"
      className="group grid h-full w-full place-items-center border-b border-[var(--border-mute)] bg-[var(--bg-default)] transition-colors hover:bg-[var(--bg-muted)]"
    >
      <div className="flex items-center gap-10">
        {STATUS_DOTS.map((d) => (
          <span
            key={d.label}
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: STATUS_COLOR[d.status] }}
            aria-label={d.label}
          />
        ))}
      </div>
    </button>
  )
}

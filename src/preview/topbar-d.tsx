import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { TopBar } from '@/shell/top-bar'
import { LeftRail } from '@/shell/left-rail'
import { LeftPanel } from '@/shell/left-panel'
import { RightPanel } from '@/shell/right-panel'
import { BottomToolbar } from '@/shell/bottom-toolbar'
import { PREVIEW_HOP } from './topbar-shell'

/**
 * Variant D — TopBar spans the full width, sitting ABOVE the rail.
 *
 * Grid:
 *   "top  top   top"
 *   "rail left  right"
 *   "rail bottom bottom"
 *
 * Show/hide uses the same Apple-style center handle pill from the
 * production shell, but anchored to the BOTTOM EDGE of the TopBar so
 * its position stays meaningful even when the bar collapses to 0.
 */
export function TopBarVariantD() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <PreviewShell
      variantLabel="D · Full-width on top (TopBar spans over the rail)"
      hop={PREVIEW_HOP}
      topBarHeight={collapsed ? 0 : 124}
      onToggle={() => setCollapsed((c) => !c)}
      collapsed={collapsed}
    />
  )
}

interface ShellProps {
  variantLabel: string
  hop: Array<{ href: string; label: string }>
  topBarHeight: number
  collapsed: boolean
  onToggle: () => void
}

function PreviewShell({ variantLabel, hop, topBarHeight, collapsed, onToggle }: ShellProps) {
  return (
    <div className="min-h-dvh bg-[var(--bg-muted)]">
      <header className="flex items-center justify-between border-b border-[var(--border-mute)] bg-[var(--bg-default)] px-6 py-3">
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
            Preview
          </span>
          <h1 className="text-base font-medium text-[var(--text-default)]">{variantLabel}</h1>
        </div>
        <nav className="flex gap-4 text-sm">
          {hop.map((h) => (
            <a
              key={h.href}
              href={h.href}
              className="text-[var(--text-subtle)] underline-offset-4 hover:text-[var(--text-default)] hover:underline"
            >
              {h.label}
            </a>
          ))}
        </nav>
      </header>

      <div
        className="grid h-[calc(100dvh-49px)] w-dvw bg-[var(--bg-muted)]"
        style={{
          gridTemplateColumns: '52px 1fr 368px',
          gridTemplateRows: `${topBarHeight}px 1fr 88px`,
          transition: 'grid-template-rows 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          gridTemplateAreas: `
            "top  top    top"
            "rail left   right"
            "rail bottom bottom"
          `,
        }}
      >
        <header
          style={{ gridArea: 'top' } as CSSProperties}
          className="relative overflow-hidden border-b border-[var(--border-mute)] bg-[var(--bg-default)]"
        >
          <TopBar />
        </header>

        <aside style={{ gridArea: 'rail' }} className="bg-transparent">
          <LeftRail />
        </aside>

        <section
          style={{ gridArea: 'left / left / bottom / right' }}
          className="relative"
        >
          <div className="absolute inset-0 grid place-items-center text-[var(--text-muted)]">
            Viewport
          </div>
          {/* Handle pill at the top of the viewport area (just below TopBar) */}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Mostra pannello superiore' : 'Nascondi pannello superiore'}
            aria-expanded={!collapsed}
            className="group absolute left-1/2 top-3 z-20 grid h-6 w-20 -translate-x-1/2 place-items-center"
          >
            <span className="h-1 w-14 rounded-full bg-[var(--stone-300)] transition-colors group-hover:bg-[var(--stone-600)]" />
          </button>
          <aside className="pointer-events-auto absolute top-12 left-5 z-10">
            <LeftPanel />
          </aside>
        </section>

        <aside style={{ gridArea: 'right' }} className="bg-transparent">
          <RightPanel />
        </aside>
        <footer style={{ gridArea: 'bottom' }} className="border-none bg-transparent">
          <BottomToolbar />
        </footer>
      </div>
    </div>
  )
}

export function getRenderForRoute(slug: string): ReactNode | null {
  if (slug === 'topbar-d') return <TopBarVariantD />
  return null
}

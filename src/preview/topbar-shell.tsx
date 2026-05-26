import type { CSSProperties, ReactNode } from 'react'
import { LeftRail } from '@/shell/left-rail'
import { LeftPanel } from '@/shell/left-panel'
import { RightPanel } from '@/shell/right-panel'
import { BottomToolbar } from '@/shell/bottom-toolbar'

interface Props {
  topBarSlot: ReactNode
  topBarRowHeight: number | string
  /** Optional override for the LeftRail slot (Variant B adds a toggle button below the logo) */
  railSlot?: ReactNode
  /** Inner padding around the TopBar grid cell (Variant B uses p-4 to make the bar a floating card) */
  topBarCellStyle?: CSSProperties
  /** Animated transition for grid-template-rows when topbar collapses */
  rowsTransition?: string
  /** Banner above the shell with variant label */
  variantLabel: string
  /** Other route links shown next to the banner so you can hop between previews */
  hop: Array<{ href: string; label: string }>
}

export function TopBarPreviewShell({
  topBarSlot,
  topBarRowHeight,
  railSlot,
  topBarCellStyle,
  rowsTransition = 'grid-template-rows 250ms cubic-bezier(0.16, 1, 0.3, 1)',
  variantLabel,
  hop,
}: Props) {
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
          gridTemplateRows: `${typeof topBarRowHeight === 'number' ? `${topBarRowHeight}px` : topBarRowHeight} 1fr 88px`,
          transition: rowsTransition,
          gridTemplateAreas: `
            "rail top    top"
            "rail left   right"
            "rail bottom bottom"
          `,
        }}
      >
        <aside
          style={{ gridArea: 'rail' }}
          className="bg-transparent"
        >
          {railSlot ?? <LeftRail />}
        </aside>
        <header
          style={{ gridArea: 'top', ...topBarCellStyle }}
          className="overflow-hidden"
        >
          {topBarSlot}
        </header>
        <section style={{ gridArea: 'left / left / bottom / right' }} className="relative">
          <div className="absolute inset-0 grid place-items-center text-[var(--text-muted)]">
            Viewport
          </div>
          <aside className="pointer-events-auto absolute top-5 left-5 z-10">
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

export const PREVIEW_HOP = [
  { href: '/?preview=topbar-a', label: 'A · Status dots' },
  { href: '/?preview=topbar-b', label: 'B · Padded card' },
  { href: '/?preview=topbar-c', label: 'C · Mini-strip' },
]

import { useState } from 'react'
import LogoApp from '@/icons/logo-app.svg?react'
import Sidebar from '@/icons/sidebar.svg?react'
import { TopBar } from './shell/top-bar'
import { LeftPanel } from './shell/left-panel'
import { RightPanel } from './shell/right-panel'
import { BottomToolbar } from './shell/bottom-toolbar'
import { Avatar } from './components/primitives/avatar'
import { TopBarVariantA } from './preview/topbar-a'
import { TopBarVariantB } from './preview/topbar-b'
import { TopBarVariantC } from './preview/topbar-c'
import { TopBarVariantD } from './preview/topbar-d'

// Card is 124px; we pad the cell with 16px top + 16px sides (no bottom). The
// 16px gap between the TopBar card and the panels below comes from the
// LeftPanel/RightPanel margins, matching the external 16px so the whole shell
// reads as one consistent gutter.
const TOP_BAR_HEIGHT = 140

export default function App() {
  if (typeof window !== 'undefined') {
    const preview = new URLSearchParams(window.location.search).get('preview')
    if (preview === 'topbar-a') return <TopBarVariantA />
    if (preview === 'topbar-b') return <TopBarVariantB />
    if (preview === 'topbar-c') return <TopBarVariantC />
    if (preview === 'topbar-d') return <TopBarVariantD />
  }

  const [topBarCollapsed, setTopBarCollapsed] = useState(false)

  return (
    <div
      className="grid h-dvh w-dvw bg-[var(--bg-muted)]"
      style={{
        gridTemplateColumns: '52px 1fr 368px',
        gridTemplateRows: `${topBarCollapsed ? 0 : TOP_BAR_HEIGHT}px 1fr 88px`,
        transition: 'grid-template-rows 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        gridTemplateAreas: `
          "rail top    top"
          "rail left   right"
          "rail bottom bottom"
        `,
      }}
    >
      <aside style={{ gridArea: 'rail' }} className="bg-transparent">
        <Rail
          collapsed={topBarCollapsed}
          onToggle={() => setTopBarCollapsed((c) => !c)}
        />
      </aside>
      <header
        style={{
          gridArea: 'top',
          padding: topBarCollapsed ? 0 : '16px 16px 0 16px',
          transition: 'padding 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="h-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-default)]"
          style={{
            boxShadow: 'var(--shadow-base)',
            opacity: topBarCollapsed ? 0 : 1,
            transform: topBarCollapsed ? 'translateY(-8px)' : 'translateY(0)',
            transition: 'opacity 200ms ease-out, transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <TopBar />
        </div>
      </header>
      <section
        style={{ gridArea: 'left / left / bottom / right' }}
        className="relative"
      >
        <div className="absolute inset-0 grid place-items-center text-[var(--text-muted)]">
          Viewport
        </div>
        <aside className="pointer-events-auto absolute top-4 left-4 z-10">
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
  )
}

function Rail({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="flex h-full flex-col items-center py-4">
      <div className="grid h-11 w-11 place-items-center rounded-md text-[var(--icon-default)]">
        <LogoApp className="h-6 w-6" />
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Mostra pannello superiore' : 'Nascondi pannello superiore'}
          aria-pressed={!collapsed}
          className="grid h-11 w-11 place-items-center rounded-full text-[var(--icon-default-muted)] hover:bg-[var(--border-mute)] hover:text-[var(--icon-default)]"
        >
          <Sidebar className="h-5 w-5 rotate-90" />
        </button>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-[var(--icon-default-muted)] hover:bg-[var(--border-mute)]"
          aria-label="Account"
        >
          <Avatar
            src="https://i.pravatar.cc/64?u=andrea-mangano"
            initials="AM"
            size={32}
          />
        </button>
      </div>
    </div>
  )
}

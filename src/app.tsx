import { useState } from 'react'
import { TopBar } from './shell/top-bar'
import { LeftRail } from './shell/left-rail'
import { LeftPanel } from './shell/left-panel'
import { RightPanel } from './shell/right-panel'
import { BottomToolbar } from './shell/bottom-toolbar'
import { TopBarHandle } from './shell/topbar-handle'

const TOP_BAR_HEIGHT = 124

export default function App() {
  const [topBarCollapsed, setTopBarCollapsed] = useState(false)

  return (
    <div
      className="grid h-dvh w-dvw bg-[var(--bg-muted)]"
      style={{
        gridTemplateColumns: '52px 1fr 368px',
        gridTemplateRows: `${topBarCollapsed ? 0 : TOP_BAR_HEIGHT}px 1fr 88px`,
        transition: 'grid-template-rows 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        gridTemplateAreas: `
          "rail top    top"
          "rail left   right"
          "rail bottom bottom"
        `,
      }}
    >
      <aside
        style={{ gridArea: 'rail' }}
        className="border-r border-[var(--border-mute)] bg-[var(--bg-default)]"
      >
        <LeftRail />
      </aside>
      <header
        style={{ gridArea: 'top' }}
        className="overflow-hidden border-b border-[var(--border-mute)] bg-[var(--bg-default)]"
      >
        <TopBar />
      </header>
      <section
        style={{ gridArea: 'left / left / bottom / right' }}
        className="relative"
      >
        <div className="absolute inset-0 grid place-items-center text-[var(--text-muted)]">
          Viewport
        </div>
        <TopBarHandle
          collapsed={topBarCollapsed}
          onToggle={() => setTopBarCollapsed((c) => !c)}
        />
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
  )
}

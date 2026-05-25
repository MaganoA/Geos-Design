import { TopBar } from './shell/top-bar'
import { LeftRail } from './shell/left-rail'
import { LeftPanel } from './shell/left-panel'
import { RightPanel } from './shell/right-panel'
import { BottomToolbar } from './shell/bottom-toolbar'

export default function App() {
  return (
    <div
      className="grid h-dvh w-dvw bg-[var(--bg-muted)]"
      style={{
        gridTemplateColumns: '52px 1fr 348px',
        gridTemplateRows: '148px 1fr 92px',
        gridTemplateAreas: `
          "rail top    top"
          "rail left   right"
          "rail bottom bottom"
        `,
      }}
    >
      <aside style={{ gridArea: 'rail' }} className="bg-[var(--bg-default)] border-r border-[var(--border-mute)]">
        <LeftRail />
      </aside>
      <header style={{ gridArea: 'top' }} className="bg-[var(--bg-default)] border-b border-[var(--border-mute)]">
        <TopBar />
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
      <footer style={{ gridArea: 'bottom' }} className="bg-transparent border-none">
        <BottomToolbar />
      </footer>
    </div>
  )
}

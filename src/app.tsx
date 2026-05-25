import { TopBar } from './shell/top-bar'

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
        {/* LeftRail */}
      </aside>
      <header style={{ gridArea: 'top' }} className="bg-[var(--bg-default)] border-b border-[var(--border-mute)]">
        <TopBar />
      </header>
      <aside
        style={{ gridArea: 'left' }}
        className="pointer-events-auto absolute z-10 m-5"
      >
        {/* LeftPanel will float over viewport */}
      </aside>
      <section style={{ gridArea: 'left / left / bottom / right' }} className="relative">
        <div className="absolute inset-0 grid place-items-center text-[var(--text-muted)]">
          Viewport
        </div>
      </section>
      <aside style={{ gridArea: 'right' }} className="bg-[var(--bg-default)] border-l border-[var(--border-mute)]">
        {/* RightPanel */}
      </aside>
      <footer style={{ gridArea: 'bottom' }} className="bg-[var(--bg-default)] border-t border-[var(--border-mute)]">
        {/* BottomToolbar */}
      </footer>
    </div>
  )
}

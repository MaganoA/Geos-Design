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
import { ToolbarVariants } from './preview/toolbar-variants'
import { VelocitaVariants } from './preview/velocita-variants'
import { Viewport } from './viewport/canvas'
import { useSelectedDevice } from './hooks/use-selected-device'
import { useRegisterPortaleTesta1 } from './devices/portale-testa-1/register'
import { useRegisterPortaleTesta1Tenuta } from './devices/portale-testa-1-tenuta/register'
import { useRegisterPortaleTesta1Erogatore } from './devices/portale-testa-1-erogatore/register'
import { useRegisterPortaleTesta2 } from './devices/portale-testa-2/register'
import { useRegisterPortaleTesta2GripperPin } from './devices/portale-testa-2-gripper-pin/register'
import { useRegisterPortaleTesta2LampadeUv } from './devices/portale-testa-2-lampade-uv/register'
import { useRegisterSpeed } from './devices/speed/register'
import { useRegisterSpeedSoffiatore } from './devices/speed-soffiatore/register'
import { useRegisterSpeedBarraLavaggio } from './devices/speed-barra-lavaggio/register'
import { useRegisterSicurezzaElettroserrature } from './devices/sicurezza-elettroserrature/register'
import { useRegisterPianoAspirato1 } from './devices/piano-aspirato-1/register'
import { useRegisterPianoAspirato2 } from './devices/piano-aspirato-2/register'
import { useRegisterImpiantoVuoto } from './devices/impianto-vuoto/register'
import { useRegisterImpiantoAcqua } from './devices/impianto-acqua/register'
import { useRegisterImpiantoAria } from './devices/impianto-aria/register'
import { useRegisterRobot } from './devices/robot/register'
import { useRegisterToolStand } from './devices/tool-stand/register'
import { useRegisterToolStandGripperPiccolo } from './devices/tool-stand-gripper-piccolo/register'
import { useRegisterToolStandGripperMedio } from './devices/tool-stand-gripper-medio/register'
import { useRegisterToolStandGripperGrande } from './devices/tool-stand-gripper-grande/register'
import { useRegisterToolStandGripperDistanziali } from './devices/tool-stand-gripper-distanziali/register'

const TOP_BAR_HEIGHT = 140
const RIGHT_PANEL_WIDTH = 368
// Width of the left rail column. Mirrors gridTemplateColumns below.
const RAIL_WIDTH = 52

// Motion choreography for the TopBar collapse/expand. Asymmetric on
// purpose: opening is gentler (the user is about to read), closing is
// snappier (system response). The container moves on the iOS drawer
// curve; content uses ease-out-expo with a slight delay on open so the
// card body reveals *after* the row has begun expanding.
const TRANSITION_OPEN = {
  gridRows: 'grid-template-rows 320ms cubic-bezier(0.32, 0.72, 0, 1)',
  cellPadding: 'padding 320ms cubic-bezier(0.32, 0.72, 0, 1)',
  cardOpacity: 'opacity 220ms 80ms cubic-bezier(0.16, 1, 0.3, 1)',
  cardTransform: 'transform 280ms 60ms cubic-bezier(0.16, 1, 0.3, 1)',
}
const TRANSITION_CLOSE = {
  gridRows: 'grid-template-rows 200ms cubic-bezier(0.32, 0.72, 0, 1)',
  cellPadding: 'padding 200ms cubic-bezier(0.32, 0.72, 0, 1)',
  cardOpacity: 'opacity 140ms cubic-bezier(0.16, 1, 0.3, 1)',
  cardTransform: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
}

export default function App() {
  const [topBarCollapsed, setTopBarCollapsed] = useState(false)

  // Seed live device state and subscribe to the 100 ms tick. Hooks must
  // run unconditionally before any early return (the preview routing
  // below), so they sit at the very top of the component.
  useRegisterPortaleTesta1()
  useRegisterPortaleTesta1Tenuta()
  useRegisterPortaleTesta1Erogatore()
  useRegisterPortaleTesta2()
  useRegisterPortaleTesta2GripperPin()
  useRegisterPortaleTesta2LampadeUv()
  useRegisterSpeed()
  useRegisterSpeedSoffiatore()
  useRegisterSpeedBarraLavaggio()
  useRegisterSicurezzaElettroserrature()
  useRegisterPianoAspirato1()
  useRegisterPianoAspirato2()
  useRegisterImpiantoVuoto()
  useRegisterImpiantoAcqua()
  useRegisterImpiantoAria()
  useRegisterRobot()
  useRegisterToolStand()
  useRegisterToolStandGripperPiccolo()
  useRegisterToolStandGripperMedio()
  useRegisterToolStandGripperGrande()
  useRegisterToolStandGripperDistanziali()

  // Right column collapses to 0 when there's nothing to show. Col 2 (1fr)
  // absorbs the freed width, so the 3D Canvas grows into it. The whole
  // shell animates as a unit via grid-template-columns.
  const { device } = useSelectedDevice()

  if (typeof window !== 'undefined') {
    const preview = new URLSearchParams(window.location.search).get('preview')
    if (preview === 'topbar-a') return <TopBarVariantA />
    if (preview === 'topbar-b') return <TopBarVariantB />
    if (preview === 'topbar-c') return <TopBarVariantC />
    if (preview === 'topbar-d') return <TopBarVariantD />
    if (preview === 'toolbar-variants') return <ToolbarVariants />
    if (preview === 'velocita-variants') return <VelocitaVariants />
  }

  const t = topBarCollapsed ? TRANSITION_CLOSE : TRANSITION_OPEN
  const rightColVisible = !!device && device.meta.hasData !== false

  return (
    <div
      className="grid h-dvh w-dvw bg-[var(--bg-muted)]"
      style={{
        gridTemplateColumns: `52px 1fr ${rightColVisible ? RIGHT_PANEL_WIDTH : 0}px`,
        gridTemplateRows: `${topBarCollapsed ? 0 : TOP_BAR_HEIGHT}px 1fr`,
        transition: `${t.gridRows}, grid-template-columns 320ms cubic-bezier(0.32, 0.72, 0, 1)`,
        gridTemplateAreas: `
          "rail top    top"
          "rail left   right"
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
          transition: t.cellPadding,
        }}
      >
        <div
          className="h-full overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-default)]"
          style={{
            boxShadow: 'var(--shadow-base)',
            opacity: topBarCollapsed ? 0 : 1,
            transform: topBarCollapsed ? 'translateY(-8px)' : 'translateY(0)',
            transition: `${t.cardOpacity}, ${t.cardTransform}`,
            willChange: 'transform, opacity',
          }}
        >
          <TopBar />
        </div>
      </header>
      {/* Viewport section spans just col 2 of the main row (full lower
          height — no bottom-toolbar row pushing it up). The Canvas
          physically sits in this cell only; LeftPanel + BottomToolbar
          float over it as absolute cards, never carving space out of
          the 3D area. */}
      <section style={{ gridArea: 'left' }} className="relative">
        <Viewport />
        <aside className="pointer-events-auto absolute top-4 bottom-4 left-4 z-10">
          <LeftPanel />
        </aside>
      </section>
      <aside style={{ gridArea: 'right' }} className="bg-transparent">
        <RightPanel />
      </aside>
      {/* Bottom toolbar — fixed to the viewport so its centering covers
        the full horizontal band between the left rail and the right
        edge of the right panel, instead of just the 1fr "left" grid
        cell (which left it visibly off-centre once the right panel
        opened). The right offset animates with the right column so
        the toolbar slides into its new centre as the panel reveals. */}
      <div
        className="pointer-events-none fixed bottom-0 z-20 flex justify-center pb-4"
        style={{
          left: RAIL_WIDTH,
          right: rightColVisible ? RIGHT_PANEL_WIDTH : 0,
          transition: 'right 320ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div className="pointer-events-auto">
          <BottomToolbar />
        </div>
      </div>
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
          className="grid h-11 w-11 place-items-center rounded-full text-[var(--icon-default-muted)] transition-transform duration-150 ease-out hover:bg-[var(--border-mute)] hover:text-[var(--icon-default)] active:scale-[0.96]"
        >
          <Sidebar
            className="h-5 w-5"
            style={{
              transform: collapsed ? 'rotate(270deg)' : 'rotate(90deg)',
              transition: 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          />
        </button>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-[var(--icon-default-muted)] transition-transform duration-150 ease-out hover:bg-[var(--border-mute)] active:scale-[0.96]"
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

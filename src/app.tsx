import { useEffect, useState } from 'react'
import LogoApp from '@/icons/logo-app.svg?react'
import AlignLeftSquare from '@/icons/align-left-square.svg?react'
import { LeftPanel } from './shell/left-panel'
import { RightPanel } from './shell/right-panel'
import { BottomToolbar } from './shell/bottom-toolbar'
import { TopBar } from './shell/top-bar'
import { Avatar } from './components/primitives/avatar'
import { TopBarVariantA } from './preview/topbar-a'
import { TopBarVariantB } from './preview/topbar-b'
import { TopBarVariantC } from './preview/topbar-c'
import { TopBarVariantD } from './preview/topbar-d'
import { ToolbarVariants } from './preview/toolbar-variants'
import { VelocitaVariants } from './preview/velocita-variants'
import { Viewport } from './viewport/canvas'
import { useSelectedDevice } from './hooks/use-selected-device'
import { useMachineStore } from './store/machine-store'
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
import { useRegisterBaiaGrezzi } from './devices/baia-grezzi/register'
import { useRegisterBaiaGrezziVassoio } from './devices/baia-grezzi-vassoio/register'
import { useRegisterBaiaGrezziFotocellule } from './devices/baia-grezzi-fotocellule/register'
import { useRegisterBaiaGrezziTastatore } from './devices/baia-grezzi-tastatore/register'
import { useRegisterBaiaLavorati } from './devices/baia-lavorati/register'
import { useRegisterBaiaLavoratiVassoio } from './devices/baia-lavorati-vassoio/register'
import { useRegisterDispenserDistanziali } from './devices/dispenser-distanziali/register'
import { useRegisterErogazioneResina } from './devices/erogazione-resina/register'
import { useRegisterErogazioneResinaSerbatoio } from './devices/erogazione-resina-serbatoio/register'
import { useRegisterErogazioneResinaErogatore } from './devices/erogazione-resina-erogatore/register'
import { useRegisterErogazioneResinaAlimentatoreInserti } from './devices/erogazione-resina-alimentatore-inserti/register'

const RAIL_WIDTH = 52
const PANEL_GAP = 16
const LEFT_PANEL_WIDTH = 348
const TOP_BAR_TOP = 16
const TOP_BAR_HEIGHT = 124
const TOP_BAR_BOTTOM = TOP_BAR_TOP + TOP_BAR_HEIGHT

export default function App() {
  const initialTheme =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('theme') === 'dark'
        ? 'dark'
        : 'light'
      : 'light'
  const [theme] = useState<'light' | 'dark'>(initialTheme)
  const [topBarVisible, setTopBarVisible] = useState(false)

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
  useRegisterBaiaGrezzi()
  useRegisterBaiaGrezziVassoio()
  useRegisterBaiaGrezziFotocellule()
  useRegisterBaiaGrezziTastatore()
  useRegisterBaiaLavorati()
  useRegisterBaiaLavoratiVassoio()
  useRegisterDispenserDistanziali()
  useRegisterErogazioneResina()
  useRegisterErogazioneResinaSerbatoio()
  useRegisterErogazioneResinaErogatore()
  useRegisterErogazioneResinaAlimentatoreInserti()

  const { id, device, select } = useSelectedDevice()
  useEffect(() => {
    if (!id) select('tool-stand-gripper-piccolo')
  }, [id, select])
  useEffect(() => {
    const store = useMachineStore.getState()
    store.patchDevice('tool-stand', {
      status: 'active',
      gripperMontato: 'piccolo',
    })
    store.patchDevice('tool-stand-gripper-piccolo', {
      status: 'idle',
      stato: 'niente',
      dx: 60,
      dy: 60,
    })
  }, [])

  if (typeof window !== 'undefined') {
    const preview = new URLSearchParams(window.location.search).get('preview')
    if (preview === 'topbar-a') return <TopBarVariantA />
    if (preview === 'topbar-b') return <TopBarVariantB />
    if (preview === 'topbar-c') return <TopBarVariantC />
    if (preview === 'topbar-d') return <TopBarVariantD />
    if (preview === 'toolbar-variants') return <ToolbarVariants />
    if (preview === 'velocita-variants') return <VelocitaVariants />
  }

  const rightPanelVisible = !!device && device.meta.hasData !== false
  const toolbarVisible = !!device && device.meta.hasCommands !== false

  return (
    <div
      data-theme={theme}
      className={[
        'relative h-dvh w-dvw overflow-hidden bg-[var(--bg-global)] text-[var(--text-default)]',
        theme === 'dark' ? 'dark' : '',
      ].join(' ')}
    >
      <aside className="pointer-events-auto absolute inset-y-0 left-0 z-50 w-[52px] bg-transparent">
        <Rail
          topBarVisible={topBarVisible}
          onToggleTopBar={() => setTopBarVisible((visible) => !visible)}
        />
      </aside>

      <section className="absolute inset-y-0 right-0 left-[52px]">
        <Viewport />
        <aside
          className="pointer-events-auto absolute bottom-4 left-0 z-10"
          style={{
            top: topBarVisible ? TOP_BAR_BOTTOM + PANEL_GAP : 17,
            transition: 'top 280ms var(--ease-camera)',
          }}
        >
          <LeftPanel />
        </aside>
      </section>

      <header
        className="absolute right-4 z-20 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-default)]"
        style={{
          border: '0.5px solid var(--border-mute)',
          top: TOP_BAR_TOP,
          left: RAIL_WIDTH,
          height: TOP_BAR_HEIGHT,
          boxShadow: '0 1px 2px -1px rgb(0 0 0 / 0.45), 0 1px 3px 0 rgb(0 0 0 / 0.35)',
          opacity: topBarVisible ? 1 : 0,
          transform: topBarVisible ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: topBarVisible ? 'auto' : 'none',
          transition:
            'opacity 200ms var(--ease-out), transform 240ms var(--ease-out)',
        }}
      >
        <TopBar />
      </header>

      <aside
        className="pointer-events-auto absolute right-4 z-20 w-[352px]"
        style={{
          top: topBarVisible ? TOP_BAR_BOTTOM + PANEL_GAP : 22,
          opacity: rightPanelVisible ? 1 : 0,
          transform: rightPanelVisible ? 'translateX(0)' : 'translateX(8px)',
          transition:
            'top 280ms var(--ease-camera), opacity 200ms var(--ease-out), transform 240ms var(--ease-out)',
          pointerEvents: rightPanelVisible ? 'auto' : 'none',
        }}
      >
        <RightPanel />
      </aside>

      <div
        className="pointer-events-none fixed bottom-0 z-30 -translate-x-1/2 pb-4"
        style={{
          left: `calc(${RAIL_WIDTH + LEFT_PANEL_WIDTH + PANEL_GAP}px + (100vw - ${RAIL_WIDTH + LEFT_PANEL_WIDTH + PANEL_GAP}px) / 2)`,
          opacity: toolbarVisible ? 1 : 0,
          transform: toolbarVisible
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(8px)',
          transition:
            'opacity 220ms var(--ease-out), transform 260ms var(--ease-out)',
          pointerEvents: toolbarVisible ? 'auto' : 'none',
        }}
      >
        <div className="pointer-events-auto">
          <BottomToolbar />
        </div>
      </div>
    </div>
  )
}

function Rail({
  topBarVisible,
  onToggleTopBar,
}: {
  topBarVisible: boolean
  onToggleTopBar: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center py-4">
      <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[var(--bg-state-secondary)] text-[var(--icon-default)]">
        <LogoApp className="h-6 w-6" />
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onToggleTopBar}
          aria-label={topBarVisible ? 'Nascondi barra lavorazioni' : 'Mostra barra lavorazioni'}
          aria-pressed={topBarVisible}
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-[var(--icon-default-muted)] transition-transform duration-150 ease-out hover:bg-[var(--bg-state-soft)] hover:text-[var(--icon-default)] active:scale-[0.96]"
        >
          <AlignLeftSquare
            className="h-3.5 w-3.5"
            style={{
              transform: topBarVisible ? 'rotate(270deg)' : 'rotate(90deg)',
              transition: 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          />
        </button>
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--icon-default-muted)] transition-transform duration-150 ease-out hover:bg-[var(--bg-state-soft)] active:scale-[0.96]"
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

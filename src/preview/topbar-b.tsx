import { useState } from 'react'
import LogoApp from '@/icons/logo-app.svg?react'
import Sidebar from '@/icons/sidebar.svg?react'
import { TopBar } from '@/shell/top-bar'
import { Avatar } from '@/components/primitives/avatar'
import { TopBarPreviewShell, PREVIEW_HOP } from './topbar-shell'

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

export function TopBarVariantB() {
  const [collapsed, setCollapsed] = useState(false)
  const t = collapsed ? TRANSITION_CLOSE : TRANSITION_OPEN

  return (
    <TopBarPreviewShell
      variantLabel="B · Padded inset card (toggle next to avatar, Figma-aligned)"
      hop={PREVIEW_HOP}
      topBarRowHeight={collapsed ? 0 : 140}
      topBarCellStyle={{
        padding: collapsed ? 0 : '16px 16px 0 16px',
        transition: t.cellPadding,
      }}
      railSlot={<CustomRail collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />}
      rowsTransition={t.gridRows}
      topBarSlot={
        <div
          className="h-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-default)]"
          style={{
            boxShadow: 'var(--shadow-base)',
            opacity: collapsed ? 0 : 1,
            transform: collapsed ? 'translateY(-8px)' : 'translateY(0)',
            transition: `${t.cardOpacity}, ${t.cardTransform}`,
            willChange: 'transform, opacity',
          }}
        >
          <TopBar />
        </div>
      }
    />
  )
}

function CustomRail({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
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

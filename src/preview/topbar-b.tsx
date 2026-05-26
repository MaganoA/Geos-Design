import { useState } from 'react'
import LogoApp from '@/icons/logo-app.svg?react'
import UserIcon from '@/icons/user.svg?react'
import Eye from '@/icons/eye.svg?react'
import EyeSlash from '@/icons/eye-slash.svg?react'
import { TopBar } from '@/shell/top-bar'
import { TopBarPreviewShell, PREVIEW_HOP } from './topbar-shell'

export function TopBarVariantB() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <TopBarPreviewShell
      variantLabel="B · Padded inset card (toggle next to avatar, Figma-aligned)"
      hop={PREVIEW_HOP}
      topBarRowHeight={collapsed ? 0 : 140}
      topBarCellStyle={{ padding: collapsed ? 0 : '16px 16px 0 16px' }}
      railSlot={<CustomRail collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />}
      rowsTransition="grid-template-rows 280ms cubic-bezier(0.16, 1, 0.3, 1), padding 280ms cubic-bezier(0.16, 1, 0.3, 1)"
      topBarSlot={
        <div
          className="h-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-default)]"
          style={{
            boxShadow: 'var(--shadow-base)',
            opacity: collapsed ? 0 : 1,
            transform: collapsed ? 'translateY(-8px)' : 'translateY(0)',
            transition: 'opacity 200ms ease-out, transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
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
          className="grid h-11 w-11 place-items-center rounded-full text-[var(--icon-default-muted)] hover:bg-[var(--border-mute)] hover:text-[var(--icon-default)]"
        >
          {collapsed ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-[var(--icon-default-muted)] hover:bg-[var(--border-mute)] hover:text-[var(--icon-default)]"
          aria-label="Account"
        >
          <UserIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

import LogoApp from '@/icons/logo-app.svg?react'
import UserIcon from '@/icons/user.svg?react'

export function LeftRail() {
  return (
    <div className="flex h-full flex-col items-center justify-between py-4">
      <div className="grid h-11 w-11 place-items-center rounded-md text-[var(--icon-default)]">
        <LogoApp className="h-6 w-6" />
      </div>
      <button
        type="button"
        className="grid h-11 w-11 place-items-center rounded-full text-[var(--icon-default-muted)] hover:bg-[var(--border-mute)] hover:text-[var(--icon-default)]"
        aria-label="Account"
      >
        <UserIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

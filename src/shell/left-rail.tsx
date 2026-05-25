import { LayoutDashboard, User } from 'lucide-react'

export function LeftRail() {
  return (
    <div className="flex h-full flex-col items-center justify-between py-3">
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-md text-[var(--icon-default)] hover:bg-[var(--bg-muted)]"
        aria-label="Dashboard"
      >
        <LayoutDashboard size={20} />
      </button>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-[var(--icon-default-muted)] hover:bg-[var(--bg-muted)]"
        aria-label="Account"
      >
        <User size={20} />
      </button>
    </div>
  )
}

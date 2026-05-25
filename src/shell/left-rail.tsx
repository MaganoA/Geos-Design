import { User } from 'lucide-react'
import { Logo } from '@/components/icons/logo'

export function LeftRail() {
  return (
    <div className="flex h-full flex-col items-center justify-between py-4">
      <div className="grid h-11 w-11 place-items-center rounded-md text-[var(--icon-default)]">
        <Logo className="h-6 w-6" />
      </div>
      <button
        type="button"
        className="grid h-11 w-11 place-items-center rounded-full text-[var(--icon-default-muted)] hover:bg-[var(--bg-muted)]"
        aria-label="Account"
      >
        <User size={20} />
      </button>
    </div>
  )
}

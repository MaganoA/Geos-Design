import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { DeviceStatus } from '@/types/device'

const styles: Record<DeviceStatus, { bg: string; dot: string; text: string }> = {
  active: {
    bg: 'bg-[var(--bg-badge-green)]',
    dot: 'bg-[var(--status-active)]',
    text: 'text-[var(--text-success)]',
  },
  idle: {
    bg: 'bg-[var(--bg-muted)]',
    dot: 'bg-[var(--status-idle)]',
    text: 'text-[var(--text-muted)]',
  },
  warning: {
    bg: 'bg-[var(--bg-muted)]',
    dot: 'bg-[var(--status-warning)]',
    text: 'text-[var(--text-default)]',
  },
  error: {
    bg: 'bg-[var(--bg-badge-red)]',
    dot: 'bg-[var(--status-error)]',
    text: 'text-[var(--bg-state-danger)]',
  },
  offline: {
    bg: 'bg-[var(--bg-muted)]',
    dot: 'bg-[var(--status-offline)]',
    text: 'text-[var(--text-muted)]',
  },
}

export function StatusBadge({
  status,
  children,
}: {
  status: DeviceStatus
  children: ReactNode
}) {
  const s = styles[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        s.bg,
        s.text,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {children}
    </span>
  )
}

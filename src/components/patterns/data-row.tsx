import type { ReactNode } from 'react'
import { Text } from '@/components/primitives/text'

/**
 * Single label/value row. Tight vertical padding (6 px) — values are
 * short numeric strings; the surrounding section already provides
 * outer breathing room.
 */
export function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <Text variant="sm/normal" className="text-[var(--text-muted)]">
        {label}
      </Text>
      <Text
        variant="sm/normal"
        className="text-[var(--text-default)] tabular-nums"
      >
        {value}
      </Text>
    </div>
  )
}

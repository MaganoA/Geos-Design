import type { ReactNode } from 'react'
import { Text } from '@/components/primitives/text'

export function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
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

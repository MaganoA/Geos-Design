import type { ReactNode } from 'react'
import { Text } from '@/components/primitives/text'

export function DataSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-b border-[var(--border-mute)] last:border-b-0">
      <header className="px-3 pt-3 pb-2">
        <Text variant="sm/medium">{title}</Text>
      </header>
      <div className="pb-3">{children}</div>
    </section>
  )
}

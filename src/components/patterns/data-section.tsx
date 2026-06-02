import type { ReactNode } from 'react'
import { Text } from '@/components/primitives/text'

/**
 * A grouped block of related rows. Renders as a subtly-bordered region
 * — NOT a card. (Cards inside the already-shadowed RightPanel would
 * read as nested chrome; we want visual containment without depth.)
 */
export function DataSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section
      className="rounded-[var(--radius-md)] px-3 pt-3 pb-2"
      style={{ border: '0.5px solid var(--border-mute)' }}
    >
      <header className="mb-2">
        <Text variant="sm/medium">{title}</Text>
      </header>
      <div className="flex flex-col">{children}</div>
    </section>
  )
}

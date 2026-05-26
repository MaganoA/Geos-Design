import { Badge } from '@/components/ui/badge'

interface ChipProps {
  label: string
  primary: string
  secondaryItems?: string[]
}

function Chip({ label, primary, secondaryItems = [] }: ChipProps) {
  return (
    <div className="flex min-w-[228px] flex-col gap-3 border-r border-[var(--border-mute)] px-6 py-5">
      <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
        {label}
      </span>
      <span className="truncate text-base font-medium text-[var(--text-default)]">
        {primary}
      </span>
      {secondaryItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {secondaryItems.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="rounded-md px-2.5 py-1 text-sm font-normal text-[var(--text-default)]"
            >
              {s}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopBar() {
  return (
    <div className="flex h-full items-stretch">
      <Chip
        label="Ricetta"
        primary="Lastra 1500x450x6 Gress Rosso"
        secondaryItems={['F3Y1080.1', 'Flex 3', 'Visualizza Ordini']}
      />
      <Chip label="Robot" primary="L12 - Insertatura" secondaryItems={['Lastra 1', 'Foro 2']} />
      <Chip label="Portale - Testa 1" primary="L12 - Insertatura" secondaryItems={['Lastra 1', 'Foro 2']} />
      <Chip label="Portale - Testa 2" primary="L12 - Insertatura" secondaryItems={['Lastra 1', 'Foro 2']} />
      <Chip label="Speed" primary="L1 - Foratura" secondaryItems={['Lastra 1', 'Foro 2']} />
    </div>
  )
}

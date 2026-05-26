interface ChipProps {
  label: string
  primary: string
  secondaryItems?: string[]
}

function Chip({ label, primary, secondaryItems = [] }: ChipProps) {
  const tags = secondaryItems.filter((s) => !s.startsWith('Visualizza'))
  return (
    <div className="flex min-w-[260px] flex-col gap-3 border-r border-[var(--border-mute)] px-6 py-5">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {label}
        </span>
        <span className="text-base font-medium leading-snug text-[var(--text-default)]">
          {primary}
        </span>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((s) => (
            <span
              key={s}
              className="rounded-sm bg-[var(--bg-muted)] px-2 py-0.5 text-xs font-medium tracking-wide text-[var(--text-subtle)]"
            >
              {s}
            </span>
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

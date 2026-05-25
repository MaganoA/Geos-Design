import { Badge } from '@/components/ui/badge'

interface ChipProps {
  label: string
  primary: string
  secondaryItems?: string[]
}

function Chip({ label, primary, secondaryItems = [] }: ChipProps) {
  return (
    <div className="flex flex-col gap-2 px-6 py-4 border-r border-[var(--border-mute)] min-w-[200px]">
      <span className="text-[12px] font-medium tracking-[0.143em] uppercase text-[var(--text-muted)]">
        {label}
      </span>
      <span className="text-[14px] font-medium text-[var(--text-default)] truncate">
        {primary}
      </span>
      {secondaryItems.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {secondaryItems.map((s) => (
            <Badge key={s} variant="secondary" className="font-normal">
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
    <div className="flex items-stretch h-full">
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

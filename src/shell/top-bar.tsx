import { useDeviceState } from '@/hooks/use-device-state'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import LastraIcon from '@/icons/lastra.svg?react'
import SelectCircleAreaIcon from '@/icons/select-circle-area.svg?react'
import type { PortaleTesta1State } from '@/devices/portale-testa-1/state'

interface ChipProps {
  label: string
  primary: string
  deviceId?: string
  secondaryItems?: string[]
  showDivider?: boolean
}

function Chip({
  label,
  primary,
  deviceId,
  secondaryItems = [],
  showDivider = true,
}: ChipProps) {
  const { select } = useSelectedDevice()
  const tags = secondaryItems.filter((s) => !s.startsWith('Visualizza'))
  const interactive = !!deviceId
  const badgeLabel = (tag: string) => {
    if (tag.startsWith('Lastra ')) return tag.replace('Lastra ', '')
    if (tag.startsWith('Foro ')) return tag.replace('Foro ', '')
    return tag
  }
  const badgeIcon = (tag: string) => {
    if (tag.startsWith('Lastra') || tag.startsWith('L-')) {
      return <LastraIcon className="h-3.5 w-3.5 shrink-0 text-[var(--icon-default-disabled)]" />
    }
    if (tag.startsWith('Foro') || tag.startsWith('F-')) {
      return <SelectCircleAreaIcon className="h-3 w-3 shrink-0 text-[var(--icon-default-disabled)]" />
    }
    return null
  }

  const content = (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-[var(--radius-md)] px-4 py-4 transition-colors group-hover:bg-white/[0.06]">
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
              className="inline-flex items-center gap-1 rounded-sm bg-[var(--bg-muted)] px-2 py-0.5 text-xs font-normal tracking-wide text-[var(--text-subtle)]"
            >
              {badgeIcon(s)}
              {badgeLabel(s)}
            </span>
          ))}
        </div>
      )}
    </div>
  )

  const baseClass = 'group min-w-0 p-2 text-left'
  const style = showDivider
    ? { borderRight: '0.5px solid var(--border-mute)' }
    : undefined

  if (!interactive) {
    return (
      <div className={baseClass} style={style}>
        {content}
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={() => select(deviceId)}
      className={baseClass}
      style={style}
    >
      {content}
    </button>
  )
}

export function TopBar() {
  // Portale Testa 1 is the only device with a live state schema in this
  // milestone. The other chips remain static until their devices land.
  const testa1 = useDeviceState<PortaleTesta1State>('portale-testa-1')
  const testa1Primary = testa1?.lavorazione
    ? `${testa1.lavorazione.idLavoro} - Insertatura`
    : 'L12 - Insertatura'
  const testa1Tags = [
    testa1?.lavorazione?.idLastra ?? 'Lastra 1',
    testa1?.lavorazione?.indiceForo ?? 'Foro 2',
  ]

  return (
    <div className="grid h-full grid-cols-[1.18fr_repeat(4,1fr)] items-stretch">
      <Chip
        label="Ricetta"
        primary="Lastra 1500x450x6 Gress Rosso"
        secondaryItems={['F3Y1080.1', 'Flex 3', 'Visualizza Ordini']}
      />
      <Chip
        label="Robot"
        primary="L12 - Insertatura"
        deviceId="robot"
        secondaryItems={['Lastra 1', 'Foro 2']}
      />
      <Chip
        label="Portale - Testa 1"
        primary={testa1Primary}
        deviceId="portale-testa-1"
        secondaryItems={testa1Tags}
      />
      <Chip
        label="Portale - Testa 2"
        primary="L12 - Insertatura"
        deviceId="portale-testa-2"
        secondaryItems={['Lastra 1', 'Foro 2']}
      />
      <Chip
        label="Speed"
        primary="L1 - Foratura"
        deviceId="speed"
        secondaryItems={['Lastra 1', 'Foro 2']}
        showDivider={false}
      />
    </div>
  )
}

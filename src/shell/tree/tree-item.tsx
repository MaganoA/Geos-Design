import type { DeviceMeta } from '@/types'
import CaretRight from '@/icons/caret-right.svg?react'

interface Props {
  meta: DeviceMeta
  depth: number
  selected: boolean
  hasChildren: boolean
  expanded: boolean
  onToggle: () => void
  onSelect: () => void
  onHover: (id: string | null) => void
}

export function TreeItem({ meta, depth, selected, hasChildren, expanded, onToggle, onSelect, onHover }: Props) {
  // Categories with selectable=false ignore selection — clicking just expand/collapses.
  const isCategory = meta.selectable === false

  return (
    <button
      type="button"
      onMouseEnter={() => onHover(meta.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        const onCaret = (e.target as HTMLElement).dataset.role === 'toggle'
        if (isCategory) {
          // Caret toggles. Row click *only expands* — never collapses, so
          // operators always reveal the children instead of accidentally hiding them.
          if (onCaret) onToggle()
          else if (!expanded) onToggle()
          return
        }
        if (hasChildren && onCaret) {
          onToggle()
        } else {
          onSelect()
        }
      }}
      className={[
        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition',
        isCategory
          ? 'font-medium text-[var(--text-default)] hover:bg-[var(--bg-muted)]'
          : selected
            ? 'bg-[var(--bg-muted)] font-medium text-[var(--text-default)]'
            : 'font-medium text-[var(--text-subtle)] hover:bg-[var(--bg-muted)]',
      ].join(' ')}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      {hasChildren ? (
        <CaretRight
          data-role="toggle"
          className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''} text-[var(--icon-default-subtle)]`}
        />
      ) : (
        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--icon-default-muted)]" />
      )}
      <span>{meta.label}</span>
    </button>
  )
}

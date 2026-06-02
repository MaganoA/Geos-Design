import { useEffect, useRef } from 'react'
import type { DeviceMeta } from '@/types'
import CaretRight from '@/icons/caret-right.svg?react'

interface Props {
  meta: DeviceMeta
  depth: number
  selected: boolean
  focused: boolean
  hasChildren: boolean
  expanded: boolean
  onToggle: () => void
  onSelect: () => void
  onFocus: () => void
  onHover: (id: string | null) => void
}

export function TreeItem({
  meta,
  depth,
  selected,
  focused,
  hasChildren,
  expanded,
  onToggle,
  onSelect,
  onFocus,
  onHover,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const isCategory = meta.selectable === false

  // When this item becomes focused via keyboard navigation, move the DOM
  // focus to its button so the native focus ring follows and the user can
  // continue arrow-keying.
  useEffect(() => {
    if (focused && document.activeElement !== ref.current) {
      ref.current?.focus({ preventScroll: false })
    }
  }, [focused])

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={focused ? 0 : -1}
      onFocus={onFocus}
      onMouseEnter={() => onHover(meta.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        const onCaret = (e.target as HTMLElement).dataset.role === 'toggle'
        if (onCaret) {
          onToggle()
          return
        }
        if (hasChildren && !expanded) onToggle()
        if (!isCategory) onSelect()
      }}
      className={[
        'flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[13px] leading-[18.57px] transition outline-none',
        'focus-visible:ring-2 focus-visible:ring-[var(--border-input-highlight)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-default)]',
        isCategory
          ? 'font-medium text-[var(--text-default)] hover:bg-[var(--bg-state-soft)]'
          : selected
            ? 'bg-[var(--bg-state-soft)] font-medium text-[var(--text-default)]'
            : 'font-medium text-[var(--text-default)] hover:bg-[var(--bg-state-soft)]',
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

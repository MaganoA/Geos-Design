import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useMemo, useState } from 'react'
import type { DeviceMeta } from '@/types'
import { allDevices } from '@/devices'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { useSelectionStore } from '@/store/selection-store'
import { TreeItem } from './tree-item'

export function DeviceTree() {
  const { id: selectedId, select } = useSelectedDevice()
  const setHovered = useSelectionStore((s) => s.setHovered)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['portale']))

  const devices = useMemo(() => allDevices().map((d) => d.meta), [])
  const byParent = useMemo(() => {
    const m = new Map<string | null, DeviceMeta[]>()
    for (const d of devices) {
      const arr = m.get(d.parentId) ?? []
      arr.push(d)
      m.set(d.parentId, arr)
    }
    return m
  }, [devices])
  const byId = useMemo(() => {
    const m = new Map<string, DeviceMeta>()
    for (const d of devices) m.set(d.id, d)
    return m
  }, [devices])

  // Flat list of visible rows (parent collapsed → children excluded). The
  // arrow keys traverse this list in order; Right/Left expand/collapse the
  // current row's children before traversing.
  const visible = useMemo(() => {
    const out: DeviceMeta[] = []
    function walk(parentId: string | null) {
      const kids = byParent.get(parentId) ?? []
      for (const m of kids) {
        out.push(m)
        if (expanded.has(m.id)) walk(m.id)
      }
    }
    walk(null)
    return out
  }, [byParent, expanded])

  // Roving tabindex anchor. Defaults to the first visible row; clicks update
  // it via the row's onFocus.
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const effectiveFocusedId = focusedId ?? selectedId ?? visible[0]?.id ?? null

  function expandId(id: string) {
    setExpanded((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }
  function collapseId(id: string) {
    setExpanded((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }
  function toggleId(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const idx = visible.findIndex((m) => m.id === effectiveFocusedId)
    if (idx < 0) return
    const current = visible[idx]
    if (!current) return
    const childCount = (byParent.get(current.id) ?? []).length

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const next = visible[Math.min(idx + 1, visible.length - 1)]
        if (next) setFocusedId(next.id)
        return
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prev = visible[Math.max(idx - 1, 0)]
        if (prev) setFocusedId(prev.id)
        return
      }
      case 'ArrowRight': {
        e.preventDefault()
        if (childCount > 0) {
          if (!expanded.has(current.id)) {
            expandId(current.id)
          } else {
            const firstChild = byParent.get(current.id)?.[0]
            if (firstChild) setFocusedId(firstChild.id)
          }
        }
        return
      }
      case 'ArrowLeft': {
        e.preventDefault()
        if (expanded.has(current.id) && childCount > 0) {
          collapseId(current.id)
        } else if (current.parentId) {
          setFocusedId(current.parentId)
        }
        return
      }
      case 'Home': {
        e.preventDefault()
        const first = visible[0]
        if (first) setFocusedId(first.id)
        return
      }
      case 'End': {
        e.preventDefault()
        const last = visible[visible.length - 1]
        if (last) setFocusedId(last.id)
        return
      }
      case 'Enter':
      case ' ': {
        e.preventDefault()
        if (current.selectable === false) {
          // Pure category — same semantics as the row click: expand only.
          if (childCount > 0) expandId(current.id)
        } else {
          select(current.id)
          if (childCount > 0 && !expanded.has(current.id)) expandId(current.id)
        }
        return
      }
    }
  }

  function renderLevel(parentId: string | null, depth = 0): React.ReactNode {
    const children = byParent.get(parentId) ?? []
    return children.map((meta) => {
      const kids = byParent.get(meta.id) ?? []
      const hasChildren = kids.length > 0
      const isOpen = expanded.has(meta.id)
      return (
        <div key={meta.id}>
          <TreeItem
            meta={meta}
            depth={depth}
            selected={selectedId === meta.id}
            focused={effectiveFocusedId === meta.id}
            hasChildren={hasChildren}
            expanded={isOpen}
            onToggle={() => toggleId(meta.id)}
            onSelect={() => {
              if (meta.selectable !== false) select(meta.id)
            }}
            onFocus={() => setFocusedId(meta.id)}
            onHover={setHovered}
          />
          {hasChildren && isOpen && renderLevel(meta.id, depth + 1)}
        </div>
      )
    })
  }

  // void byId here just to silence unused-var lint while keeping the map
  // available for future use (e.g. ARIA setsize/posinset annotations).
  void byId

  return (
    <div
      role="tree"
      aria-label="Dispositivi macchina"
      className="flex flex-col gap-0.5 outline-none"
      onKeyDown={handleKeyDown}
    >
      {renderLevel(null)}
    </div>
  )
}

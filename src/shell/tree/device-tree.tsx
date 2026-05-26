import { useState } from 'react'
import { allDevices } from '@/devices'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { useSelectionStore } from '@/store/selection-store'
import { TreeItem } from './tree-item'

export function DeviceTree() {
  const { id: selectedId, select } = useSelectedDevice()
  const setHovered = useSelectionStore((s) => s.setHovered)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['portale']))

  const devices = allDevices().map((d) => d.meta)
  const byParent = new Map<string | null, typeof devices>()
  devices.forEach((d) => {
    const arr = byParent.get(d.parentId) ?? []
    arr.push(d)
    byParent.set(d.parentId, arr)
  })

  function render(parentId: string | null, depth = 0): React.ReactNode {
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
            hasChildren={hasChildren}
            expanded={isOpen}
            onToggle={() =>
              setExpanded((prev) => {
                const next = new Set(prev)
                if (next.has(meta.id)) next.delete(meta.id)
                else next.add(meta.id)
                return next
              })
            }
            onSelect={() => select(meta.id)}
            onHover={setHovered}
          />
          {hasChildren && isOpen && render(meta.id, depth + 1)}
        </div>
      )
    })
  }

  return <div className="flex flex-col gap-0.5">{render(null)}</div>
}

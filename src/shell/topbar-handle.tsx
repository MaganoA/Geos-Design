interface Props {
  collapsed: boolean
  onToggle: () => void
}

export function TopBarHandle({ collapsed, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Mostra pannello superiore' : 'Nascondi pannello superiore'}
      aria-expanded={!collapsed}
      className="group absolute left-1/2 top-3 z-20 grid h-6 w-20 -translate-x-1/2 place-items-center"
    >
      <span
        className="h-1 w-14 rounded-full bg-[var(--stone-300)] transition-colors group-hover:bg-[var(--stone-600)]"
      />
    </button>
  )
}

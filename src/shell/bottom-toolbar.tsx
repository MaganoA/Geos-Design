export function BottomToolbar() {
  return (
    <div className="grid h-full place-items-center">
      <div
        className="w-[348px] h-[76px] bg-[var(--bg-default)] rounded-[var(--radius-md)] grid place-items-center text-[var(--text-muted)] text-sm"
        style={{ boxShadow: 'var(--shadow-demo)' }}
      >
        Select a device
      </div>
    </div>
  )
}

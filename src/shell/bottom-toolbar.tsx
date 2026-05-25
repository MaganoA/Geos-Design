export function BottomToolbar() {
  return (
    <div className="grid h-full place-items-center px-5">
      <div
        className="grid h-[68px] min-w-[348px] place-items-center rounded-[var(--radius-md)] bg-[var(--bg-default)] px-6 text-sm text-[var(--text-muted)]"
        style={{ boxShadow: 'var(--shadow-demo)' }}
      >
        Select a device
      </div>
    </div>
  )
}

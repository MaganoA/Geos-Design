export function RightPanel() {
  return (
    <div
      className="h-full w-[348px] m-5 ml-0 bg-[var(--bg-default)] rounded-[var(--radius-md)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-base)' }}
    >
      <div className="grid h-full place-items-center text-[var(--text-muted)] text-sm">
        Select a device
      </div>
    </div>
  )
}

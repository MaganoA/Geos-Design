export function RightPanel() {
  return (
    <div
      className="m-5 ml-0 h-[calc(100%-2.5rem)] w-[calc(100%-1.25rem)] overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-default)]"
      style={{ boxShadow: 'var(--shadow-base)' }}
    >
      <div className="grid h-full place-items-center text-sm text-[var(--text-muted)]">
        Select a device
      </div>
    </div>
  )
}

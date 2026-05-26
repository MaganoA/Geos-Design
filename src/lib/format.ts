export function formatMm(n: number): string {
  return `${n.toFixed(1)} mm`
}

export function formatTime(epochMs: number | null): string {
  if (!epochMs) return '—'
  const d = new Date(epochMs)
  return d.toTimeString().slice(0, 8)
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`
}

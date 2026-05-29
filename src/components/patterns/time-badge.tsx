import { cn } from '@/lib/cn'

/**
 * Compact muted chip showing a clock icon + a time string. Ambient
 * session metadata that lives at the top of a device panel — it tells
 * the operator "the data below is from this moment", without competing
 * with operational metrics for attention. Tabular-nums so the digits
 * don't shift width as seconds tick.
 *
 * Visual weight: --bg-muted background, --text-muted ink, --border-mute
 * outline. Sits a step below DataRow values, which are --text-default.
 */
export function TimeBadge({
  time,
  className,
}: {
  time: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-muted)] px-2.5 py-1 text-[12px] tabular-nums text-[var(--text-muted)] ring-1 ring-[var(--border-mute)]',
        className,
      )}
    >
      <ClockIcon className="h-3.5 w-3.5" />
      {time}
    </span>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M8 4.25 L8 8 L10.5 9.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

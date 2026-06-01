import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'

/**
 * Compact muted chip showing a clock icon + a time string. Composes
 * the shadcn Badge primitive (secondary variant) with a tabular-nums
 * override so the digits don't shift width as seconds tick. Lives next
 * to the device StatusBadge in the panel header — both are session
 * metadata, both share the Badge primitive.
 */
export function TimeBadge({
  time,
  className,
}: {
  time: string
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      // The shadcn `secondary` variant resolves to a fill that's
      // heavier than the project's muted token, which pulls the badge
      // up the visual hierarchy past the status pill — wrong for
      // ambient session metadata. Override the bg explicitly so the
      // chip sits a step below the StatusBadge in weight.
      className={cn(
        'bg-[var(--bg-muted)] tabular-nums text-[var(--text-muted)]',
        className,
      )}
    >
      <ClockIcon />
      {time}
    </Badge>
  )
}

function ClockIcon() {
  // Sized by the Badge's [&>svg]:size-3 rule — no width/height needed.
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
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

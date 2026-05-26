import { useState } from 'react'

interface Props {
  initials: string
  src?: string
  size?: number
}

/**
 * Account-switcher avatar matching the Figma slot (1398:12701).
 *
 * Renders a circular photo when `src` resolves; falls back to a
 * tinted-bg + white-inverted initials chip otherwise. Designed for
 * 28-32px at the bottom-left of the rail.
 */
export function Avatar({ initials, src, size = 32 }: Props) {
  const [errored, setErrored] = useState(false)

  if (src && !errored) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="shrink-0 rounded-full object-cover"
        style={{
          width: size,
          height: size,
          boxShadow: 'inset 0 0 0 1px var(--border-default)',
        }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-[var(--stone-800)] text-[var(--text-inverted)]"
      style={{ width: size, height: size, fontSize: 11, fontWeight: 500, letterSpacing: 0.2 }}
      aria-hidden="true"
    >
      <span>{initials}</span>
    </div>
  )
}

import type { SVGProps } from 'react'

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Flexpin1"
      {...props}
    >
      <path d="M7 4 L15 4 L13 28 L5 28 Z" />
      <path d="M19 4 L27 4 L25 28 L17 28 Z" />
    </svg>
  )
}

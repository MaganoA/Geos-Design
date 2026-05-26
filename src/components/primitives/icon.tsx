import type { ComponentType, SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  as: ComponentType<SVGProps<SVGSVGElement>>
  size?: number
}

/**
 * Thin wrapper that forces a consistent icon size + currentColor across
 * the app. Works with the bundled Geos `*.svg?react` set as well as any
 * SVG component that accepts the standard SVG props.
 */
export function Icon({ as: As, size = 20, ...props }: IconProps) {
  return <As width={size} height={size} {...props} />
}

import { createElement, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant =
  | '3xl/medium'
  | 'xl/medium'
  | 'lg/medium'
  | 'sm/medium'
  | 'sm/normal'
  | 'xs/medium'

const styles: Record<Variant, string> = {
  '3xl/medium': 'text-[30px] leading-9 font-medium tracking-[-0.033em]',
  'xl/medium': 'text-[20px] leading-7 font-medium',
  'lg/medium': 'text-[18px] leading-7 font-medium',
  'sm/medium': 'text-[14px] leading-5 font-medium',
  'sm/normal': 'text-[14px] leading-5 font-normal',
  'xs/medium': 'text-[12px] leading-4 font-medium tracking-[0.143em]',
}

interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  variant: Variant
  as?: keyof HTMLElementTagNameMap
  uppercase?: boolean
  children?: ReactNode
}

export function Text({
  variant,
  as = 'span',
  uppercase,
  className,
  children,
  ...rest
}: Props) {
  return createElement(
    as,
    {
      className: cn(styles[variant], uppercase && 'uppercase', className),
      ...rest,
    },
    children,
  )
}

import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'yellow' | 'blue' | 'black' | 'white' | 'green' | 'outline'

const variantClasses: Record<Variant, string> = {
  yellow: 'bg-brutal-yellow text-black',
  blue: 'bg-brutal-blue text-white',
  black: 'bg-black text-white',
  white: 'bg-white text-black',
  green: 'bg-brutal-green text-black',
  outline: 'bg-transparent text-black',
}

type Props = {
  children: ReactNode
  variant?: Variant
  className?: string
  to?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
}

export function BrutalButton({
  children,
  variant = 'yellow',
  className = '',
  to,
  href,
  onClick,
  type = 'button',
  size = 'md',
}: Props) {
  const base = `font-bold uppercase tracking-wide border-[3px] border-black shadow-brutal brutal-press inline-flex items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={base}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={base}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={base}>
      {children}
    </button>
  )
}

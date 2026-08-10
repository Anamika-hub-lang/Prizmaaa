import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'outlineOrange' | 'purple' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-educture-orange text-white hover:bg-educture-orange-dark btn-lift',
  outline: 'bg-white text-[#1d1d1d] border border-gray-300 hover:border-gray-400 hover:bg-gray-50',
  outlineOrange: 'bg-white text-educture-orange border border-educture-orange hover:bg-educture-cream',
  purple: 'bg-konned-purple text-white hover:bg-konned-purple-dark',
  ghost: 'bg-transparent text-gray-700 hover:text-educture-orange',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

type Props = {
  children: ReactNode
  variant?: Variant
  size?: Size
  to?: string
  className?: string
  type?: 'button' | 'submit'
  onClick?: () => void
}

export function AppButton({
  children,
  variant = 'primary',
  size = 'md',
  to,
  className = '',
  type = 'button',
  onClick,
}: Props) {
  const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-colors ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={base} onClick={onClick}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={base}>
      {children}
    </button>
  )
}

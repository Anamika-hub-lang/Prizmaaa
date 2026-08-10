import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
  as?: 'div' | 'button'
}

export function Card({ children, className = '', onClick, as = 'div' }: CardProps) {
  const base =
    'rounded-2xl border border-orange-100/80 bg-white shadow-sm transition-all duration-300 ' +
    (onClick ? 'cursor-pointer hover:shadow-md hover:border-orange-200 hover:-translate-y-0.5 ' : '')

  if (as === 'button') {
    return (
      <button type="button" onClick={onClick} className={`${base} text-left w-full ${className}`}>
        {children}
      </button>
    )
  }

  return (
    <div onClick={onClick} className={`${base} ${className}`} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  )
}

type BadgeProps = {
  children: ReactNode
  variant?: 'orange' | 'emerald' | 'gray' | 'sky'
  className?: string
}

const badgeVariants = {
  orange: 'bg-educture-orange/10 text-educture-orange border-educture-orange/20',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  gray: 'bg-gray-50 text-gray-600 border-gray-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
}

export function Badge({ children, variant = 'orange', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeVariants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
}

const buttonVariants = {
  primary:
    'bg-educture-orange text-white shadow-[0_8px_28px_rgba(243,112,33,0.35)] hover:bg-educture-orange-dark',
  outline: 'bg-white text-gray-800 border-2 border-orange-100 hover:border-educture-orange/40 hover:bg-[#fff9f3]',
  ghost: 'bg-transparent text-gray-600 hover:text-educture-orange hover:bg-orange-50/50',
}

const buttonSizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-sm',
}

export function CounselingButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 ${buttonVariants[variant]} ${buttonSizes[size]} ${
        disabled ? 'opacity-70 cursor-not-allowed hover:translate-y-0' : 'hover:-translate-y-0.5'
      } ${className}`}
    >
      {children}
    </button>
  )
}

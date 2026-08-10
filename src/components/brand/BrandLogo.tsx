import { Link } from 'react-router-dom'

export const BRAND_NAME = 'PRIZMA'
export const BRAND_LOGO_SRC = '/prizma-logo.png'

const sizeStyles = {
  sm: {
    img: 'h-10 w-10 sm:h-11 sm:w-11',
    text: 'text-base sm:text-lg tracking-[0.14em]',
    gap: 'gap-2 sm:gap-2.5',
  },
  md: {
    img: 'h-11 w-11 sm:h-12 sm:w-12',
    text: 'text-lg sm:text-xl tracking-[0.16em]',
    gap: 'gap-2.5 sm:gap-3',
  },
  lg: {
    img: 'h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16',
    text: 'text-xl sm:text-2xl tracking-[0.18em]',
    gap: 'gap-3 sm:gap-3.5',
  },
} as const

type BrandLogoProps = {
  to?: string | null
  size?: keyof typeof sizeStyles
  showWordmark?: boolean
  /** Light backgrounds use dark text; dark backgrounds use white text */
  tone?: 'light' | 'dark'
  className?: string
}

export function BrandLogo({
  to = '/',
  size = 'md',
  showWordmark = true,
  tone = 'light',
  className = '',
}: BrandLogoProps) {
  const s = sizeStyles[size]
  const wordmark =
    tone === 'dark'
      ? 'font-bold text-white'
      : 'font-bold text-[#1d1d1d]'

  const inner = (
    <>
      <img
        src={BRAND_LOGO_SRC}
        alt={BRAND_NAME}
        className={`${s.img} object-contain shrink-0 rounded-lg`}
        width={64}
        height={64}
      />
      {showWordmark && (
        <span className={`${wordmark} ${s.text} uppercase`}>{BRAND_NAME}</span>
      )}
    </>
  )

  const wrapperClass = `inline-flex items-center ${s.gap} shrink-0 min-w-0 ${className}`

  if (to) {
    return (
      <Link to={to} className={wrapperClass}>
        {inner}
      </Link>
    )
  }

  return <div className={wrapperClass}>{inner}</div>
}

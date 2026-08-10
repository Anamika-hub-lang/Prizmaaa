import { BRAND_NAME } from './BrandLogo'

/** Text-only brand label when an image is already shown elsewhere */
export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-bold uppercase tracking-[0.16em] text-[#1d1d1d] ${className}`}>
      {BRAND_NAME}
    </span>
  )
}

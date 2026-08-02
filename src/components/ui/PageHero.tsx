import type { ReactNode } from 'react'

type Props = {
  badge?: string
  title: string
  description?: string
  children?: ReactNode
  image?: string
  imageAlt?: string
  cream?: boolean
}

export function PageHero({
  badge,
  title,
  description,
  children,
  image,
  imageAlt = '',
  cream = true,
}: Props) {
  return (
    <section className={cream ? 'bg-[#fff9f3]' : 'bg-white'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className={`grid gap-10 items-center ${image ? 'lg:grid-cols-2' : ''}`}>
          <div className="text-left">
            {badge && (
              <span className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em]">
                {badge}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1d1d1d] leading-tight mt-3 mb-4">
              {title}
            </h1>
            {description && (
              <p className="text-gray-500 text-sm sm:text-base max-w-xl leading-relaxed">{description}</p>
            )}
            {children}
          </div>
          {image && (
            <div className="relative">
              <div className="absolute bottom-0 right-0 w-[85%] h-[80%] bg-educture-orange/90 rounded-3xl rounded-tr-[3rem] -z-0" />
              <img
                src={image}
                alt={imageAlt}
                className="relative z-10 w-full rounded-3xl shadow-card object-cover aspect-[4/3]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

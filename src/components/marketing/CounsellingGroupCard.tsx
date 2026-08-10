import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { CounsellingGroup } from '../../data/counsellingServices'

type Props = {
  group: CounsellingGroup
  variant?: 'plain' | 'image'
  size?: 'default' | 'medium' | 'compact'
}

export function CounsellingGroupCard({ group, variant = 'plain', size = 'default' }: Props) {
  if (variant === 'image') {
    const isCompact = size === 'compact'
    const isMedium = size === 'medium'
    const minHeight = isCompact
      ? 'min-h-[112px] sm:min-h-[120px]'
      : isMedium
        ? 'min-h-[150px] sm:min-h-[165px] lg:min-h-0'
        : 'min-h-[168px] sm:min-h-[190px]'

    return (
      <Link
        to={`/counselling/${group.id}`}
        className={`group relative block h-full overflow-hidden border-2 border-white/10 text-left hover:border-educture-orange/50 transition-all ${
          isCompact ? 'rounded-xl' : 'rounded-2xl'
        } ${minHeight}`}
      >
        <img
          src={group.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />
        <div
          className={`relative z-10 flex h-full flex-col justify-end ${
            isCompact ? 'p-3' : isMedium ? 'p-4 sm:p-5' : 'p-4 sm:p-5'
          } ${minHeight}`}
        >
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-educture-orange">
            {group.topicCount} sessions
          </p>
          <h3
            className={`font-display text-white leading-tight ${
              isCompact
                ? 'text-base sm:text-lg mt-0.5'
                : isMedium
                  ? 'text-lg sm:text-xl lg:text-2xl mt-1'
                  : 'text-xl sm:text-2xl mt-1'
            }`}
          >
            {group.title}
          </h3>
          <p
            className={`text-gray-200 mt-0.5 ${
              isCompact
                ? 'text-[10px] sm:text-[11px] line-clamp-1'
                : isMedium
                  ? 'text-xs sm:text-sm'
                  : 'text-xs sm:text-sm'
            }`}
          >
            {group.subtitle}
          </p>
          <span
            className={`inline-flex items-center font-semibold text-educture-orange group-hover:gap-2 transition-all ${
              isCompact
                ? 'mt-1.5 text-xs gap-1'
                : isMedium
                  ? 'mt-2.5 sm:mt-3 text-sm gap-1.5'
                  : 'mt-3 text-sm gap-1.5 group-hover:gap-2.5'
            }`}
          >
            Explore
            <ArrowRight className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/counselling/${group.id}`}
      className="group flex h-full flex-col rounded-2xl border-2 border-white/10 bg-white/[0.06] p-5 sm:p-6 text-left hover:border-educture-orange/50 hover:bg-white/[0.09] transition-all"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-educture-orange">
        {group.topicCount} sessions
      </p>
      <h3 className="font-display text-2xl sm:text-[1.65rem] text-white mt-2 leading-tight">{group.title}</h3>
      <p className="text-sm text-gray-200 mt-1">{group.subtitle}</p>
      <p className="text-xs text-gray-400 mt-2 leading-relaxed flex-1">{group.description}</p>
      <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-educture-orange group-hover:gap-2.5 transition-all">
        Explore
        <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  )
}

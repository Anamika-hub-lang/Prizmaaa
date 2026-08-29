import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import type { University } from '../../data/universities'
import { universityTypeLabels } from '../../data/universities'
import { StarRating } from './StarRating'
import { UniversityImage } from './UniversityImage'

type Props = {
  university: University
  avgRating: number | null
  reviewCount: number
  variant?: 'list' | 'featured'
}

export function UniversityCard({ university, avgRating, reviewCount, variant = 'list' }: Props) {
  if (variant === 'featured') {
    return (
      <Link
        to={`/universities/${university.id}`}
        className="group relative block min-h-[200px] overflow-hidden rounded-2xl border-2 border-orange-100 text-left hover:border-educture-orange/60 transition-all shadow-sm"
      >
        <UniversityImage
          src={university.image}
          alt={`${university.name} campus`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="relative z-10 flex min-h-[200px] flex-col justify-end p-4">
          <span className="inline-flex w-fit rounded-full bg-white/15 border border-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-200">
            {universityTypeLabels[university.type]}
          </span>
          <h3 className="font-display text-lg text-white mt-2 leading-tight">{university.shortName}</h3>
          <p className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            {university.location}
          </p>
          <div className="flex items-center justify-between mt-3">
            {avgRating !== null ? (
              <div className="flex items-center gap-2">
                <StarRating value={avgRating} size="sm" />
                <span className="text-xs text-gray-300">
                  {avgRating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-orange-200">Be the first to review</span>
            )}
            <span className="text-educture-orange opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/universities/${university.id}`}
      className="group flex gap-4 rounded-2xl border-2 border-orange-100 bg-white p-4 text-left hover:border-educture-orange/50 hover:shadow-md transition-all"
    >
      <UniversityImage
        src={university.image}
        alt={`${university.name} campus`}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-orange-50 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-educture-orange">
              {universityTypeLabels[university.type]}
            </span>
            <h3 className="font-display text-base sm:text-lg text-[#1a1a1a] leading-tight mt-0.5">
              {university.shortName}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {university.location}, {university.state}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-educture-orange shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
        </div>
        <div className="mt-2">
          {avgRating !== null ? (
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating value={avgRating} size="sm" showValue />
              <span className="text-xs text-gray-500">
                ({reviewCount} review{reviewCount === 1 ? '' : 's'})
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No reviews yet — share yours</p>
          )}
        </div>
      </div>
    </Link>
  )
}

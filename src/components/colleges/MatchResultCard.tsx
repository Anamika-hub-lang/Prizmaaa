import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import type { CollegeMatch } from '../../lib/colleges/types'
import { formatFees, formatPackage } from '../../lib/colleges/repository'
import { UniversityLeadCtas } from '../universities/UniversityLeadCtas'

type Props = {
  match: CollegeMatch
  rank?: number
}

export function MatchResultCard({ match, rank }: Props) {
  const { college } = match

  return (
    <article className="flex h-full flex-col rounded-2xl border border-orange-100/80 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3 min-h-[4.5rem]">
        {rank != null ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-educture-orange text-white text-xs font-bold">
            {rank}
          </span>
        ) : null}
        <div className="min-w-0">
          <Link
            to={`/colleges/${college.slug}`}
            className="font-display text-lg leading-snug text-[#1a1a1a] hover:text-educture-orange line-clamp-2"
          >
            {college.name}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {college.city}, {college.state}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-orange-50 pt-4 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Fees</p>
          <p className="mt-0.5 font-semibold text-[#1a1a1a]">{formatFees(college.fees)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Avg package</p>
          <p className="mt-0.5 font-semibold text-[#1a1a1a]">
            {formatPackage(college.averagePackage)}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-6">
        <UniversityLeadCtas
          compact
          universityId={college.slug}
          universityName={college.name}
          locationHint={`${college.city}, ${college.state}`}
          courseOptions={[...college.courses, 'Undecided / need counselling']}
        />
        <Link
          to={`/colleges/${college.slug}`}
          className="block text-center text-sm font-semibold text-educture-orange hover:underline"
        >
          Full profile
        </Link>
      </div>
    </article>
  )
}

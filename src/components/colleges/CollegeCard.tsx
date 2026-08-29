import { Link } from 'react-router-dom'
import { Building2, MapPin } from 'lucide-react'
import type { College } from '../../lib/colleges/types'
import { collegeTypeLabel, formatFees, formatPackage } from '../../lib/colleges/repository'
import { UniversityLeadCtas } from '../universities/UniversityLeadCtas'

type Props = {
  college: College
}

export function CollegeCard({ college }: Props) {
  return (
    <article className="h-full flex flex-col rounded-2xl border-[3px] border-orange-100 bg-white overflow-hidden hover:border-educture-orange transition-colors">
      <div className="p-4 pb-3 bg-[#fff9f3] border-b border-orange-100">
        <UniversityLeadCtas
          compact
          universityId={college.slug}
          universityName={college.name}
          locationHint={`${college.city}, ${college.state}`}
          courseOptions={[...college.courses, 'Undecided / need counselling']}
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[11px] font-bold uppercase tracking-wider text-educture-orange">
          {collegeTypeLabel(college.type)}
        </p>
        <h3 className="font-display text-base text-[#1a1a1a] mt-1 leading-snug line-clamp-2">
          <Link to={`/colleges/${college.slug}`} className="hover:text-educture-orange">
            {college.name}
          </Link>
        </h3>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {college.city}, {college.state}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-gray-400 text-[11px]">Fees</dt>
            <dd className="font-semibold text-gray-800">{formatFees(college.fees)}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-[11px]">Avg package</dt>
            <dd className="font-semibold text-gray-800">{formatPackage(college.averagePackage)}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {college.courses.slice(0, 2).map((course) => (
            <span
              key={course}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-gray-700"
            >
              {course}
            </span>
          ))}
        </div>

        <Link
          to={`/colleges/${college.slug}`}
          className="mt-auto pt-3 text-xs font-semibold text-educture-orange hover:underline"
        >
          View details →
        </Link>
      </div>
    </article>
  )
}

export function CollegeCardSkeleton() {
  return (
    <div className="rounded-2xl border-[3px] border-orange-100 bg-white p-5 animate-pulse">
      <div className="h-4 w-20 bg-orange-100 rounded" />
      <div className="h-6 w-3/4 bg-gray-100 rounded mt-3" />
      <div className="h-4 w-1/2 bg-gray-100 rounded mt-2" />
    </div>
  )
}

export function CollegesEmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <Building2 className="w-10 h-10 text-orange-200 mx-auto" />
      <p className="text-gray-600 mt-4">No colleges match your filters.</p>
      <p className="text-sm text-gray-400 mt-1">Try adjusting course, budget, or location.</p>
    </div>
  )
}

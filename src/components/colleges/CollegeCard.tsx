import { Link } from 'react-router-dom'
import { Building2, ExternalLink, MapPin } from 'lucide-react'
import type { College } from '../../lib/colleges/types'
import { collegeTypeLabel, formatFees, formatPackage } from '../../lib/colleges/repository'
import { AdmissionPathTrail } from './AdmissionPathTrail'

type Props = {
  college: College
}

export function CollegeCard({ college }: Props) {
  return (
    <article className="rounded-2xl border-[3px] border-orange-100 bg-white p-5 hover:border-educture-orange transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-educture-orange">
            {collegeTypeLabel(college.type)}
          </p>
          <h3 className="font-display text-lg text-[#1a1a1a] mt-1 leading-snug">
            <Link to={`/colleges/${college.slug}`} className="hover:text-educture-orange">
              {college.name}
            </Link>
          </h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {college.city}, {college.state}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-orange-50">
        <AdmissionPathTrail college={college} compact />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-400 text-xs">Fees</dt>
          <dd className="font-semibold text-gray-800">{formatFees(college.fees)}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Avg package</dt>
          <dd className="font-semibold text-gray-800">{formatPackage(college.averagePackage)}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Entrance</dt>
          <dd className="font-semibold text-gray-800 truncate">{college.entrance.join(', ')}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Hostel</dt>
          <dd className="font-semibold text-gray-800">{college.hostel ? 'Yes' : 'No'}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {college.courses.slice(0, 3).map((course) => (
          <span
            key={course}
            className="text-[11px] font-medium px-2 py-1 rounded-full bg-orange-50 text-gray-700"
          >
            {course}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <Link
          to={`/colleges/${college.slug}`}
          className="font-semibold text-educture-orange hover:underline"
        >
          View details
        </Link>
        <Link
          to={`/colleges/${college.slug}#guidance`}
          className="font-semibold text-sky-700 hover:underline"
        >
          Get guided →
        </Link>
        <a
          href={college.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-educture-orange inline-flex items-center gap-1 ml-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Website
        </a>
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

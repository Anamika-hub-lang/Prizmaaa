import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { CollegeMatch } from '../../lib/colleges/types'
import { formatFees, formatPackage } from '../../lib/colleges/repository'
import { AdmissionPathTrail } from './AdmissionPathTrail'

type Props = {
  match: CollegeMatch
  rank?: number
}

export function MatchResultCard({ match, rank }: Props) {
  const { college, reasons } = match
  const positives = reasons.filter((r) => r.type === 'positive')
  const warnings = reasons.filter((r) => r.type === 'warning')

  return (
    <article className="rounded-2xl border-[3px] border-orange-100 bg-white overflow-hidden">
      <div className="bg-[#fff9f3] px-5 py-4 border-b border-orange-100">
        <div className="flex items-start gap-3">
          {rank != null && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-educture-orange text-white text-sm font-bold">
              {rank}
            </span>
          )}
          <div className="min-w-0">
            <Link
              to={`/colleges/${college.slug}`}
              className="font-display text-xl text-[#1a1a1a] hover:text-educture-orange"
            >
              {college.name}
            </Link>
            <p className="text-sm text-gray-500 mt-0.5">
              {college.city}, {college.state}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 border-b border-orange-50">
        <AdmissionPathTrail college={college} />
      </div>

      <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Fees</p>
          <p className="font-semibold">{formatFees(college.fees)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Average package</p>
          <p className="font-semibold">{formatPackage(college.averagePackage)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Highest package</p>
          <p className="font-semibold">{formatPackage(college.highestPackage)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Entrance</p>
          <p className="font-semibold">{college.entrance.join(', ')}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Hostel</p>
          <p className="font-semibold">{college.hostel ? 'Available' : 'Not available'}</p>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-gray-400 text-xs">Companies</p>
          <p className="font-semibold">{college.companies.join(', ')}</p>
        </div>
      </div>

      {positives.length > 0 && (
        <div className="px-5 pb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Why it fits</p>
          <ul className="space-y-1.5">
            {positives.map((r) => (
              <li key={r.text} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="px-5 pb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Things to note</p>
          <ul className="space-y-1.5">
            {warnings.map((r) => (
              <li key={r.text} className="flex items-start gap-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 pb-5 flex flex-wrap gap-4 text-sm border-t border-orange-50 pt-4">
        <Link to={`/colleges/${college.slug}`} className="font-semibold text-educture-orange hover:underline">
          Full profile →
        </Link>
        <Link to={`/colleges/${college.slug}#guidance`} className="font-semibold text-sky-700 hover:underline">
          Get guided →
        </Link>
      </div>
    </article>
  )
}

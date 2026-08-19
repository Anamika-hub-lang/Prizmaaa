import { ArrowRight } from 'lucide-react'
import { getAdmissionPath } from '../../lib/colleges/admissionPath'
import type { College } from '../../lib/colleges/types'

type Props = {
  college: College
  compact?: boolean
}

export function AdmissionPathTrail({ college, compact = false }: Props) {
  const steps = getAdmissionPath(college)

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {steps.map((step, index) => (
          <span key={step} className="inline-flex items-center gap-1">
            {index > 0 && <ArrowRight className="w-2.5 h-2.5 text-gray-300 shrink-0" aria-hidden />}
            <span className="text-[10px] font-medium text-gray-600">{step}</span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Path to this college</p>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 border border-orange-100 text-[11px] font-bold text-educture-orange">
              {index + 1}
            </span>
            <span className="text-gray-700 pt-0.5 leading-snug">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

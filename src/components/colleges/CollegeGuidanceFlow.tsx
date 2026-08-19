import { Link } from 'react-router-dom'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import {
  collegeGuidanceHeadline,
  collegeGuidanceIntro,
  collegeGuidanceSteps,
  collegeGuidanceSubline,
} from '../../data/collegeGuidanceFlow'
import type { College } from '../../lib/colleges/types'
import { AdmissionPathTrail } from './AdmissionPathTrail'

const accentStyles = {
  orange: {
    border: 'border-orange-100 hover:border-educture-orange/40',
    bg: 'bg-[#fff9f3]',
    icon: 'bg-educture-orange/10 text-educture-orange',
    badge: 'bg-educture-orange/10 text-educture-orange border-educture-orange/20',
  },
  sky: {
    border: 'border-sky-100 hover:border-sky-300',
    bg: 'bg-sky-50/60',
    icon: 'bg-sky-100 text-sky-700',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  violet: {
    border: 'border-violet-100 hover:border-violet-300',
    bg: 'bg-violet-50/50',
    icon: 'bg-violet-100 text-violet-700',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  slate: {
    border: 'border-gray-200 hover:border-gray-300',
    bg: 'bg-gray-50/80',
    icon: 'bg-gray-200 text-gray-700',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
  },
} as const

type Props = {
  college?: College
  variant?: 'full' | 'compact'
  id?: string
}

export function CollegeGuidanceFlow({ college, variant = 'full', id = 'guidance' }: Props) {
  const isCompact = variant === 'compact'
  const headline = collegeGuidanceHeadline(college?.name)
  const subline = college ? collegeGuidanceSubline(college.name) : collegeGuidanceIntro

  return (
    <section
      id={id}
      className={
        isCompact
          ? 'rounded-2xl border-[3px] border-orange-100 bg-white p-5 sm:p-6'
          : 'rounded-[1.75rem] border-[3px] border-orange-100 bg-white overflow-hidden'
      }
    >
      <div className={isCompact ? '' : 'bg-[#0f0f12] text-white px-5 sm:px-6 py-6 sm:py-8'}>
        <p
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${
            isCompact ? 'text-educture-orange' : 'text-orange-200'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          After you choose
        </p>
        <h2
          className={`font-display leading-tight mt-2 ${
            isCompact ? 'text-xl text-[#1a1a1a]' : 'text-2xl sm:text-3xl text-white'
          }`}
        >
          {headline}
        </h2>
        <p className={`text-sm leading-relaxed mt-2 max-w-2xl ${isCompact ? 'text-gray-600' : 'text-gray-300'}`}>
          {subline}
        </p>
      </div>

      {college && !isCompact && (
        <div className="px-5 sm:px-6 py-5 border-b border-orange-50 bg-[#fffbf7]">
          <AdmissionPathTrail college={college} />
        </div>
      )}

      <div className={isCompact ? 'mt-5' : 'p-5 sm:p-6'}>
        <div className={`grid gap-3 ${isCompact ? 'grid-cols-1 md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {collegeGuidanceSteps.map((item) => {
            const accent = accentStyles[item.accent]
            const pathLink =
              item.id === 'path' && college ? `/colleges/${college.slug}#path` : item.link

            return (
              <Link
                key={item.id}
                to={pathLink}
                className={`group rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md ${accent.border} ${accent.bg}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}
                  >
                    <item.icon className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{item.step}</span>
                </div>
                {item.badge && (
                  <span
                    className={`inline-block mt-2 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${accent.badge}`}
                  >
                    {item.badge}
                  </span>
                )}
                <h3 className="font-display text-base text-[#1a1a1a] mt-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-3">{item.description}</p>
                <p className="mt-3 text-xs font-semibold text-educture-orange inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  {item.linkLabel}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

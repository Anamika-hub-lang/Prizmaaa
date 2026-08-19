'use client'

import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Building2,
  Compass,
  GraduationCap,
  Phone,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { COUNSELLING_DURATION_LABEL, COUNSELLING_PRICE_INR } from '../../data/counsellingServices'

const collegeCount = 31
const heroCollegePreview = ['IIT Delhi', 'NIT Kurukshetra', 'DU', 'GD Goenka']

const flowTags = [
  'You choose',
  'Know the path',
  'Talk to seniors',
  'Guidance calls',
  'Build skills',
  'Find opportunities',
]

const guideSteps = [
  { label: 'Admission path', icon: Compass, to: '/colleges/find' },
  { label: 'Talk to seniors', icon: Users, to: '/university-counseling' },
  { label: `Guidance ₹${COUNSELLING_PRICE_INR}`, icon: Phone, to: '/counselling' },
  { label: 'Build skills', icon: GraduationCap, to: '/classes' },
  { label: 'Opportunities', icon: Target, to: '/ai?tool=opportunity-matcher#try' },
] as const

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#fdf8f0] w-full">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(243,112,33,0.12),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] bg-[length:24px_24px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl translate-x-1/4 translate-y-1/4"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-14 lg:pb-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start w-full min-w-0">
          <div className="text-left order-2 lg:order-1 min-w-0">
            <div className="gsap-hero-in inline-flex items-center gap-2 rounded-full border border-educture-orange/25 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-educture-orange shadow-sm mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-educture-orange animate-pulse" />
              You choose · We guide
            </div>

            <h1 className="gsap-hero-in font-display text-[2.1rem] sm:text-[2.85rem] lg:text-[3.4rem] text-[#1a1a1a] leading-[1.06] tracking-tight break-words">
              You Choose the College.{' '}
              <span className="font-script text-educture-orange text-[2.25rem] sm:text-[3.35rem] lg:text-[4rem] leading-[0.95] block mt-1 break-words">
                We Guide the Journey.
              </span>
            </h1>

            <p className="gsap-hero-in text-gray-600 text-sm sm:text-base leading-relaxed mt-5 max-w-[34rem]">
              Pick colleges by your goals, budget, courses & placements — then PRIZMA shows you the
              admission path, connects you with real seniors, ₹{COUNSELLING_PRICE_INR} guidance calls,
              skill classes & opportunities to actually get there.
            </p>

            <div className="gsap-hero-in flex flex-wrap gap-2 mt-5">
              {flowTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-orange-100/80 bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-600 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="gsap-hero-in flex flex-wrap items-center gap-3 mt-8">
              <Link
                to="/colleges/find"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_28px_rgba(243,112,33,0.35)] hover:bg-educture-orange-dark transition-all"
              >
                Find My College
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/classes"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-sky-200 bg-sky-50 text-sm font-semibold text-sky-800 hover:border-sky-400 hover:bg-sky-100 transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                Join Live Classes
              </Link>
            </div>
          </div>

          <div className="gsap-hero-img relative order-1 lg:order-2 flex justify-center lg:justify-end min-w-0 w-full lg:-mt-6">
            <div className="relative w-full max-w-[480px] space-y-3 sm:space-y-4 min-w-0">
              {/* Card 1 — You choose */}
              <Link
                to="/colleges/find"
                className="group relative block rounded-[1.75rem] border-[3px] border-white/10 bg-[#0f0f12] p-5 sm:p-6 text-left shadow-xl hover:border-educture-orange/40 transition-all overflow-hidden"
              >
                <div
                  className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-educture-orange/20 blur-2xl translate-x-1/3 -translate-y-1/3"
                  aria-hidden
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-educture-orange flex items-center gap-1.5">
                        <span className="text-orange-300/80">Step 01</span>
                        · You choose
                      </p>
                      <h2 className="font-display text-xl sm:text-2xl text-white mt-1 leading-tight">
                        Pick your college
                      </h2>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Goals · Budget · Courses · Placements · Dream companies
                      </p>
                    </div>
                    <div className="shrink-0 rounded-xl border border-educture-orange/40 bg-educture-orange/15 px-3 py-2 text-center">
                      <Building2 className="w-4 h-4 text-educture-orange mx-auto" />
                      <p className="text-lg font-bold text-white leading-none mt-0.5">{collegeCount}+</p>
                      <p className="text-[9px] text-orange-200/90">colleges</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {heroCollegePreview.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-medium text-gray-400"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-educture-orange inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Start choosing — matcher quiz
                    <ArrowUpRight className="w-4 h-4" />
                  </p>
                </div>
              </Link>

              {/* Card 2 — We guide */}
              <Link
                to="/counselling"
                className="group block rounded-[1.75rem] border-[3px] border-orange-100 bg-white p-5 sm:p-6 text-left shadow-lg hover:border-sky-300 transition-all"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Step 02–06 · We guide
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl text-[#1a1a1a] mt-1 leading-tight">
                    How to get there
                  </h2>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Path, seniors, guidance calls, skills & opportunities — all linked
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {guideSteps.map((step) => (
                    <span
                      key={step.label}
                      className="inline-flex items-center gap-1 rounded-full bg-[#fff9f3] border border-orange-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600"
                    >
                      <step.icon className="w-3 h-3 text-educture-orange shrink-0" />
                      {step.label}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm font-semibold text-sky-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Book guidance call — ₹{COUNSELLING_PRICE_INR}/{COUNSELLING_DURATION_LABEL}
                  <ArrowUpRight className="w-4 h-4" />
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

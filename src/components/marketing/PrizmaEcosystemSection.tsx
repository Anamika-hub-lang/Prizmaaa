import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, GraduationCap, IndianRupee, Star, Target, Users, Video } from 'lucide-react'
import {
  aboutPlatformBullets,
  aboutProcessValues,
  aboutHeroHighlights,
  homeStoryPreviewCount,
  prizmaJourneySteps,
  prizmaMissionLine,
  prizmaPillars,
  whyWeStartedBullets,
  type PrizmaPillar,
} from '../../data/aboutStory'

const pillarAccent: Record<PrizmaPillar['accent'], { border: string; bg: string; text: string; badge: string }> = {
  orange: {
    border: 'border-orange-100',
    bg: 'bg-[#fff9f3]',
    text: 'text-educture-orange',
    badge: 'bg-educture-orange/10 text-educture-orange border-educture-orange/30',
  },
  sky: {
    border: 'border-sky-100',
    bg: 'bg-sky-50/60',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  violet: {
    border: 'border-violet-100',
    bg: 'bg-violet-50/50',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
  },
}

type Props = {
  variant?: 'home' | 'about'
}

export function PrizmaEcosystemSection({ variant = 'home' }: Props) {
  const isAbout = variant === 'about'
  const previewCount = isAbout ? aboutPlatformBullets.length : homeStoryPreviewCount

  return (
    <section className={`${isAbout ? 'py-16 lg:py-20' : 'py-12 lg:py-16'} bg-[#fdf8f0] gsap-reveal`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`text-left ${isAbout ? 'max-w-2xl mb-10' : 'text-center max-w-2xl mx-auto mb-8'}`}>
          <p className="text-educture-orange text-[10px] font-bold uppercase tracking-[0.22em]">
            One connected platform
          </p>
          <h2 className={`font-display text-[#1a1a1a] mt-2 leading-tight ${isAbout ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {isAbout ? (
              <>
                Reviews, counselling, classes —{' '}
                <span className="font-script text-educture-orange text-3xl sm:text-4xl">one journey</span>
              </>
            ) : (
              <>
                Everything on PRIZMA{' '}
                <span className="font-script text-educture-orange text-2xl sm:text-3xl">works together</span>
              </>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{prizmaMissionLine}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 lg:mb-10">
          {prizmaPillars.map((pillar) => {
            const accent = pillarAccent[pillar.accent]
            return (
              <Link
                key={pillar.id}
                to={pillar.link}
                className={`group rounded-2xl border-2 ${accent.border} ${accent.bg} p-4 sm:p-5 text-left hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${accent.text}`}>
                    {pillar.title}
                  </p>
                  {pillar.badge && (
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${accent.badge}`}>
                      {pillar.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-4">{pillar.description}</p>
                <p className={`mt-3 text-xs font-semibold inline-flex items-center gap-1 ${accent.text} group-hover:gap-2 transition-all`}>
                  {pillar.linkLabel}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </p>
              </Link>
            )
          })}
        </div>

        {isAbout && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {prizmaJourneySteps.map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border-2 border-orange-100 bg-white p-4 sm:p-5 text-left shadow-sm"
              >
                <span className="text-2xl font-bold text-educture-orange/25">{item.step}</span>
                <h3 className="font-display text-lg text-[#1a1a1a] mt-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.description}</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-sky-600">{item.tiesTo}</p>
              </article>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <article className="rounded-3xl border-[3px] border-orange-100 bg-white p-5 sm:p-6 shadow-sm card-lift text-left">
            <div className="flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80"
                alt=""
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl object-cover border-[3px] border-orange-50"
              />
              <div className="min-w-0">
                <p className="text-sky-600 text-[10px] font-bold uppercase tracking-[0.2em]">What PRIZMA offers</p>
                <h3 className="font-display text-lg sm:text-xl text-[#1a1a1a] mt-1 leading-snug">
                  Learn, decide & grow in one place
                </h3>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 leading-relaxed">
              {aboutPlatformBullets.slice(0, previewCount).map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-educture-orange" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {!isAbout && aboutPlatformBullets.length > previewCount && (
              <p className="text-xs text-gray-400 mt-3">+{aboutPlatformBullets.length - previewCount} more on About</p>
            )}
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-educture-orange hover:underline"
            >
              {isAbout ? 'Full about page' : 'Read the full story'} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </article>

          <article className="rounded-3xl border-[3px] border-orange-100 bg-gradient-to-br from-[#fff9f3] to-orange-50/80 p-5 sm:p-6 shadow-sm card-lift text-left">
            <div className="flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80"
                alt=""
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl object-cover border-[3px] border-white shadow-sm"
              />
              <div className="min-w-0">
                <h3 className="font-display text-lg sm:text-xl text-[#1a1a1a] leading-tight">
                  Why we built
                  <span className="font-script text-educture-orange text-xl sm:text-2xl block">this platform</span>
                </h3>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 leading-relaxed">
              {whyWeStartedBullets.slice(0, previewCount).map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {!isAbout && (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/counselling"
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-educture-orange"
                >
                  Counselling
                </Link>
                <Link
                  to="/universities"
                  className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-sky-400"
                >
                  Reviews
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-educture-orange"
                >
                  Class pricing
                </Link>
              </div>
            )}
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-educture-orange hover:underline"
            >
              {isAbout ? 'Our values below' : 'See how it all connects'} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}

const valueIcons = {
  target: Target,
  users: Users,
  award: Award,
} as const

export function PrizmaValuesSection() {
  return (
    <section className="py-16 lg:py-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.2em]">How we think</p>
        <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] mt-2">Built for real decisions</h2>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Reviews, counselling, and classes are not separate products — they are steps in the same student journey.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {aboutProcessValues.map((v) => {
          const Icon = valueIcons[v.iconName]
          return (
            <div
              key={v.title}
              className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 text-left h-full card-lift shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border-[3px] border-sky-200 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-bold text-lg text-[#1a1a1a] mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const highlightIcons = {
  video: Video,
  rupee: IndianRupee,
  graduation: GraduationCap,
  star: Star,
  users: Users,
} as const

export function AboutHeroHighlights() {
  return (
    <ul className="gsap-hero-in mt-7 flex flex-col gap-2.5">
      {aboutHeroHighlights.map(({ iconName, label }) => {
        const Icon = highlightIcons[iconName]
        return (
          <li
            key={label}
            className="flex items-center gap-3 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm rounded-2xl border-[3px] border-orange-50 px-4 py-2.5 shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4eb] border-2 border-orange-100">
              <Icon className="w-4 h-4 text-educture-orange" />
            </span>
            {label}
          </li>
        )
      })}
    </ul>
  )
}

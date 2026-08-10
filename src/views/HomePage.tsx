import { Link } from 'react-router-dom'
import { ArrowUpRight, Building2, IndianRupee, Phone, Play, Star, Users, Video } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter, ContactSection } from '../components/marketing/MarketingSections'
import { PricingCards } from '../components/marketing/PricingCards'
import { useMentorContent } from '../context/MentorContentContext'
import { MentorEnrollSection } from '../components/marketing/MentorEnrollSection'
import { TestimonialsMarquee } from '../components/marketing/TestimonialsMarquee'
import { homeShowcaseClasses } from '../data/homeShowcaseClasses'
import { CounsellingSection } from '../components/marketing/CounsellingSection'
import { UniversityReviewsSection } from '../components/marketing/UniversityReviewsSection'
import { UniversityCounselingSection } from '../components/marketing/UniversityCounselingSection'
import { PrizmaEcosystemSection } from '../components/marketing/PrizmaEcosystemSection'
import { useLandingGsap } from '../hooks/useLandingGsap'
import { COUNSELLING_DURATION_LABEL, COUNSELLING_PRICE_INR } from '../data/counsellingServices'
import { pricingEcosystemIntro } from '../data/aboutStory'
import { universities } from '../data/universities'

const workPastels = ['bg-sky-50', 'bg-[#fff4eb]', 'bg-violet-50']

const heroUniversityPreview = ['IIT Bombay', 'BITS Pilani', 'DU', 'VIT']

export function HomePage() {
  useLandingGsap()
  const { publishedClasses } = useMentorContent()
  const livePreview = publishedClasses.slice(0, 3).map((c) => ({
    id: c.id,
    title: c.title,
    categoryId: c.categoryId,
    image: c.image,
  }))
  const work =
    livePreview.length >= 3
      ? livePreview
      : [...livePreview, ...homeShowcaseClasses].slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavbar />

      <main className="flex-1">
        <section className="relative overflow-x-hidden bg-gradient-to-br from-[#fff9f3] via-white to-sky-50/60">
          <div
            className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-educture-orange/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl"
            aria-hidden
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-14 lg:pt-16 pb-10 sm:pb-12 lg:pb-14 relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div className="text-left order-2 lg:order-1">
                <div className="gsap-hero-in flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-educture-orange/30 bg-educture-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-educture-orange">
                    <Video className="w-3 h-3" />
                    1-on-1 Counselling
                  </span>
                  <Link
                    to="/classes"
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800 hover:border-emerald-400 transition-colors"
                  >
                    <Users className="w-3 h-3" />
                    Live Classes
                  </Link>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">
                    <Building2 className="w-3 h-3" />
                    University Reviews
                  </span>
                  <Link
                    to="/university-counseling"
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 hover:border-violet-400 transition-colors"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
                    </span>
                    Univ. counseling
                    <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[8px] tracking-[0.12em] text-white">
                      Soon
                    </span>
                  </Link>
                </div>

                <h1 className="gsap-hero-in font-display text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] text-[#1a1a1a] leading-[1.08]">
                  Career clarity.
                  <br />
                  <span className="font-script text-educture-orange text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] leading-none block mt-1">
                    College honesty.
                  </span>
                </h1>
                <p className="gsap-hero-in text-gray-600 text-sm sm:text-[15px] leading-relaxed mt-5 max-w-md">
                  Live classes with mentors, 1-on-1 counselling, and honest reviews on{' '}
                  {universities.length}+ universities — so you learn, plan, and choose with clarity.
                </p>

                <div className="gsap-hero-in flex flex-wrap items-center gap-3 mt-8">
                  <Link
                    to="/counselling"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_32px_rgba(243,112,33,0.45)] hover:bg-educture-orange-dark transition-colors"
                  >
                    Book counselling — ₹{COUNSELLING_PRICE_INR}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/universities"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-[3px] border-sky-200 bg-white text-sm font-semibold text-sky-800 hover:border-sky-400 transition-colors"
                  >
                    <Star className="w-4 h-4 text-educture-orange fill-educture-orange" />
                    Reviews
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="gsap-hero-in flex flex-wrap items-center gap-4 mt-5">
                  <Link
                    to="/classes"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-educture-orange transition-colors"
                  >
                    View live classes
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-gray-300 hidden sm:inline">·</span>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-educture-orange transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    About PRIZMA
                  </Link>
                </div>
              </div>

              <div className="gsap-hero-img relative order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[480px] space-y-3 sm:space-y-4">
                  <Link
                    to="/counselling"
                    className="group block rounded-[1.75rem] border-[3px] border-white/10 bg-[#0f0f12] p-5 sm:p-6 text-left shadow-xl hover:border-educture-orange/40 transition-all overflow-hidden"
                  >
                    <div
                      className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-educture-orange/20 blur-2xl"
                      aria-hidden
                    />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-educture-orange">
                            Expert counselling
                          </p>
                          <h2 className="font-display text-xl sm:text-2xl text-white mt-1 leading-tight">
                            Not sure what&apos;s next?
                          </h2>
                          <p className="text-xs text-gray-400 mt-1.5">
                            Career · Domain · Future — live on Meet or call
                          </p>
                        </div>
                        <div className="shrink-0 rounded-xl border border-educture-orange/40 bg-educture-orange/15 px-3 py-2 text-center">
                          <IndianRupee className="w-4 h-4 text-educture-orange mx-auto" />
                          <p className="text-lg font-bold text-white leading-none mt-0.5">
                            {COUNSELLING_PRICE_INR}
                          </p>
                          <p className="text-[9px] text-orange-200/90">/{COUNSELLING_DURATION_LABEL}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] text-gray-400">
                          <Video className="w-3 h-3" /> Meet
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] text-gray-400">
                          <Phone className="w-3 h-3" /> Call
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-educture-orange/20 border border-educture-orange/30 px-2.5 py-1 text-[10px] font-semibold text-orange-200">
                          Roadmap included
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-educture-orange inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Book a session
                        <ArrowUpRight className="w-4 h-4" />
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/universities"
                    className="group block rounded-[1.75rem] border-[3px] border-orange-100 bg-white p-5 sm:p-6 text-left shadow-lg hover:border-sky-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">
                          By students, for students
                        </p>
                        <h2 className="font-display text-xl sm:text-2xl text-[#1a1a1a] mt-1 leading-tight">
                          University reviews
                        </h2>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Academics, campus, placements — honest ratings
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 text-educture-orange fill-educture-orange"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {heroUniversityPreview.map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-[#fff9f3] border border-orange-100 px-2.5 py-1 text-[10px] font-medium text-gray-600"
                        >
                          {name}
                        </span>
                      ))}
                      <span className="rounded-full bg-sky-50 border border-sky-100 px-2.5 py-1 text-[10px] font-semibold text-sky-700">
                        +{universities.length - heroUniversityPreview.length} more
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-sky-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Explore & write a review
                      <ArrowUpRight className="w-4 h-4" />
                    </p>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        <CounsellingSection />

        <UniversityReviewsSection />

        <UniversityCounselingSection />

        <PrizmaEcosystemSection variant="home" />

        <section id="work" className="py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 text-left lg:sticky lg:top-28 gsap-reveal">
              <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] leading-snug">
                A few recent favorites
              </h2>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                Image-based class cards — what students see after signup.
              </p>
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-full border-[3px] border-gray-300 text-sm font-semibold hover:border-educture-orange hover:text-educture-orange transition-colors"
              >
                See all projects
              </Link>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-3 gap-4">
              {work.map((c, i) => (
                <article
                  key={c.id}
                  className={`gsap-card-in group rounded-3xl border-[3px] border-orange-100 overflow-hidden ${workPastels[i]} card-lift hover:border-educture-orange transition-colors`}
                >
                  <div className="p-3 pb-0">
                    <img
                      src={c.image}
                      alt=""
                      className="w-full h-36 object-cover rounded-2xl border-[3px] border-white shadow-sm group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 pt-3 relative">
                    <p className="font-bold text-[#1a1a1a] text-sm leading-snug">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{c.categoryId} class</p>
                    <Link
                      to="/sign-in"
                      className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-educture-orange text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-sky-100/80 gsap-reveal">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.25em]">Services</p>
              <h2 className="font-display text-2xl sm:text-4xl text-[#1a1a1a] mt-2">
                Classes, counselling &{' '}
                <span className="font-script text-educture-orange text-3xl sm:text-4xl">pricing</span>
              </h2>
              <p className="text-sm text-gray-600 mt-3 max-w-2xl mx-auto leading-relaxed">
                {pricingEcosystemIntro}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <Link
                  to="/counselling"
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:border-educture-orange"
                >
                  Counselling — ₹{COUNSELLING_PRICE_INR}/{COUNSELLING_DURATION_LABEL}
                </Link>
                <Link
                  to="/universities"
                  className="rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:border-sky-400"
                >
                  University reviews — free
                </Link>
              </div>
            </div>
            <PricingCards />
            <p className="text-center mt-10">
              <Link to="/pricing" className="text-sm font-semibold text-educture-orange hover:underline">
                Full pricing page →
              </Link>
            </p>
          </div>
        </section>

        <MentorEnrollSection />

        <TestimonialsMarquee />

        <ContactSection />
      </main>

      <MarketingFooter />
    </div>
  )
}

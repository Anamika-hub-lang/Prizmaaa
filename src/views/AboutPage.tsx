import { ArrowUpRight, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { ContactSection } from '../components/marketing/MarketingSections'
import {
  AboutHeroHighlights,
  PrizmaEcosystemSection,
  PrizmaValuesSection,
} from '../components/marketing/PrizmaEcosystemSection'
import { useLandingGsap } from '../hooks/useLandingGsap'
import { prizmaMissionLine } from '../data/aboutStory'

export function AboutPage() {
  useLandingGsap()

  return (
    <PageShell className="bg-white">
      <section className="relative overflow-hidden maya-hero-bg geo-pattern">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-educture-orange/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-[-10%] h-64 w-64 rounded-full bg-sky-300/25 blur-3xl"
          aria-hidden
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-8 lg:pt-10 lg:pb-20 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-start">
            <div className="lg:col-span-5 text-left">
              <p className="gsap-hero-in inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border-[3px] border-orange-100 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700 mb-5">
                About PRIZMA
              </p>
              <h1 className="gsap-hero-in font-display text-[2rem] sm:text-[2.65rem] lg:text-[3rem] text-[#1a1a1a] leading-[1.1]">
                From college choice to{' '}
                <span className="font-script text-educture-orange text-[2.5rem] sm:text-[3.25rem] lg:text-[3.5rem] leading-none">
                  career skills
                </span>
                <span className="block mt-1">— one connected platform.</span>
              </h1>
              <p className="gsap-hero-in text-gray-600 text-sm sm:text-[15px] leading-relaxed mt-5 max-w-md">
                {prizmaMissionLine}
              </p>

              <AboutHeroHighlights />

              <div className="gsap-hero-in flex flex-wrap items-center gap-3 mt-8">
                <Link
                  to="/sign-up"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_32px_rgba(243,112,33,0.45)] btn-lift"
                >
                  Join PRIZMA
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/counselling"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-[3px] border-violet-200 bg-white text-sm font-semibold text-violet-800 hover:border-violet-400 transition-colors"
                >
                  Book counselling
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-[3px] border-gray-300/80 bg-white text-sm font-semibold text-gray-800 hover:border-educture-orange hover:text-educture-orange transition-colors"
                >
                  Class pricing
                </Link>
              </div>

              <p className="gsap-hero-in mt-8 font-script text-xl sm:text-2xl text-educture-orange max-w-xs leading-snug">
                Reviews → counselling → classes. Every step talks to the same dashboard.
              </p>
            </div>

            <div className="lg:col-span-7 gsap-hero-img">
              <div className="relative max-w-xl mx-auto lg:max-w-none lg:ml-auto">
                <div
                  className="absolute -z-10 inset-4 rounded-[2.5rem] border-[3px] border-dashed border-educture-orange/35 rotate-2"
                  aria-hidden
                />

                <div className="grid grid-cols-12 gap-3 sm:gap-4">
                  <div className="col-span-7 row-span-2 relative">
                    <img
                      src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
                      alt="Students learning together"
                      className="w-full h-full min-h-[280px] sm:min-h-[340px] rounded-[1.75rem] object-cover border-[3px] border-white shadow-xl aspect-[4/5]"
                    />
                    <div className="absolute -bottom-3 -left-2 sm:left-4 z-10 bg-educture-orange text-white rounded-2xl px-4 py-3 border-[3px] border-white shadow-lg max-w-[11rem]">
                      <p className="font-script text-lg leading-tight">Decide smart. Learn live.</p>
                    </div>
                  </div>

                  <div className="col-span-5 flex flex-col gap-3 sm:gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=500&q=80"
                      alt="Mentor teaching"
                      className="w-full rounded-[1.5rem] object-cover aspect-[4/3] border-[3px] border-white shadow-lg h-full min-h-[120px]"
                    />
                    <div className="maya-card p-4 sm:p-5 flex flex-col gap-2 card-lift border-sky-200/80">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-sky-100 border-2 border-sky-200 flex items-center justify-center">
                          <Users className="w-5 h-5 text-sky-600" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Connected</p>
                      </div>
                      <p className="text-sm font-bold text-[#1a1a1a] leading-snug">
                        Reviews, ₹200 counselling, live classes & your dashboard — all linked.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex absolute -top-4 right-2 lg:right-6 items-center gap-2 bg-white rounded-full border-[3px] border-orange-100 px-4 py-2 shadow-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-educture-orange animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700">
                    Reviews · Counselling · Classes · Counseling soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-10 sm:h-14 bg-white" style={{ clipPath: 'ellipse(120% 100% at 50% 100%)' }} aria-hidden />
      </section>

      <PrizmaEcosystemSection variant="about" />

      <PrizmaValuesSection />

      <ContactSection id="contact" />
    </PageShell>
  )
}

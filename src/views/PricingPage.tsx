import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { PricingCards } from '../components/marketing/PricingCards'
import { ContactSection } from '../components/marketing/MarketingSections'
import { TRIAL_DAYS, pricingCategoryOrder, categoryPricing, formatCategoryPlanPrices } from '../data/pricingPlans'
import { pricingEcosystemIntro, prizmaPillars } from '../data/aboutStory'
import { COUNSELLING_DURATION_LABEL, COUNSELLING_PRICE_INR } from '../data/counsellingServices'

export function PricingPage() {
  return (
    <PageShell className="bg-white">
      <section className="bg-sky-50/80 py-14 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.25em]">Services & pricing</p>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1a1a1a] mt-3">
            Classes, counselling &{' '}
            <span className="font-script text-educture-orange text-4xl sm:text-5xl">everything else</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-5 max-w-2xl mx-auto leading-relaxed">
            {pricingEcosystemIntro}
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-12 bg-white border-b border-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 text-center mb-6">
            How PRIZMA fits together
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {prizmaPillars.map((pillar) => (
              <Link
                key={pillar.id}
                to={pillar.link}
                className="rounded-2xl border-2 border-orange-100 bg-[#fff9f3] p-4 text-left hover:border-educture-orange/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#1a1a1a]">{pillar.title}</p>
                  {pillar.badge && (
                    <span className="text-[9px] font-bold uppercase text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                      {pillar.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{pillar.description}</p>
              </Link>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-6 max-w-xl mx-auto leading-relaxed">
            Live class plans below are for ongoing learning. Pair them with ₹{COUNSELLING_PRICE_INR} counselling when
            you need a roadmap, and free university reviews when you need honesty before enrollment.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-sky-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-10">
            <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.2em]">Live class plans</p>
            <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] mt-2">Skills, Professional & Academic</h2>
            <p className="text-sm text-gray-600 mt-2">
              {TRIAL_DAYS}-day trial, monthly, or 3-month bundle per track. Sign in, pick a class, pay at checkout
              (Cashfree) — then track progress on your student dashboard alongside counselling bookings.
            </p>
          </div>
          <PricingCards layout="all" />
        </div>
      </section>

      <section className="py-12 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="rounded-3xl border-[3px] border-orange-100 bg-white p-8 shadow-sm text-left">
          <h2 className="font-display text-lg text-[#1a1a1a]">Per-category class pricing</h2>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {pricingCategoryOrder
              .map((id) => `${categoryPricing[id].title}: ${formatCategoryPlanPrices(id)}`)
              .join(' · ')}
            . Starter starts your {TRIAL_DAYS}-day trial after you pick a class; Growth and Premium are chosen at
            class checkout.
          </p>
        </div>

        <div className="rounded-3xl border-[3px] border-violet-100 bg-violet-50/50 p-8 shadow-sm text-left">
          <h2 className="font-display text-lg text-[#1a1a1a]">Beyond class plans</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 leading-relaxed">
            <li>
              <strong className="text-gray-800">Expert counselling</strong> — ₹{COUNSELLING_PRICE_INR}/
              {COUNSELLING_DURATION_LABEL} for Career, Domain, or Future sessions on Meet or call.{' '}
              <Link to="/counselling" className="text-educture-orange font-semibold hover:underline">
                Book now
              </Link>
            </li>
            <li>
              <strong className="text-gray-800">University reviews</strong> — free, student-written ratings on
              academics, campus & placements.{' '}
              <Link to="/universities" className="text-educture-orange font-semibold hover:underline">
                Browse reviews
              </Link>
            </li>
            <li>
              <strong className="text-gray-800">University counseling</strong> — coming soon for SGT, GD Goenka &
              more.{' '}
              <Link to="/university-counseling" className="text-educture-orange font-semibold hover:underline">
                See what&apos;s launching
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <ContactSection />
    </PageShell>
  )
}

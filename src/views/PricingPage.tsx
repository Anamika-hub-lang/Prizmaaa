import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { PricingCards } from '../components/marketing/PricingCards'
import { ContactSection } from '../components/marketing/MarketingSections'
import { pricingCategoryOrder, categoryPricing, formatCategoryPlanPrices } from '../data/pricingPlans'
import { pricingEcosystemIntro, prizmaPillars } from '../data/aboutStory'
import { COUNSELLING_DURATION_LABEL, COUNSELLING_PRICE_INR, INTERVIEW_PREP_DURATION_LABEL, INTERVIEW_PREP_PRICE_INR } from '../data/counsellingServices'

export function PricingPage() {
  return (
    <PageShell className="bg-white">
      <section className="bg-sky-50/80 py-14 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.25em]">Plans & access</p>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1a1a1a] mt-3">
            Peer sessions, guidance &{' '}
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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
            Peer session plans below are for learning together. Pair them with ₹{COUNSELLING_PRICE_INR}{' '}
            guidance calls when you need direction, and free campus stories when you need honesty before you commit.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-sky-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-10">
            <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.2em]">Learn together plans</p>
            <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] mt-2">Skills, Professional & Academic</h2>
            <p className="text-sm text-gray-600 mt-2">
              Monthly, 3-month, or 6-month plans per track. Join, pick a peer session, pay at checkout (Cashfree) —
              then track progress in your student space.
            </p>
          </div>
          <PricingCards layout="all" />
        </div>
      </section>

      <section className="py-12 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="rounded-3xl border-[3px] border-orange-100 bg-white p-8 shadow-sm text-left">
          <h2 className="font-display text-lg text-[#1a1a1a]">Per-track session pricing</h2>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {pricingCategoryOrder
              .map((id) => `${categoryPricing[id].title}: ${formatCategoryPlanPrices(id)}`)
              .join(' · ')}
            . Choose monthly, 3 months, or 6 months at checkout.
          </p>
        </div>

        <div className="rounded-3xl border-[3px] border-violet-100 bg-violet-50/50 p-8 shadow-sm text-left">
          <h2 className="font-display text-lg text-[#1a1a1a]">Beyond session plans</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 leading-relaxed">
            <li>
              <strong className="text-gray-800">Peer & mentor guidance</strong> — ₹{COUNSELLING_PRICE_INR}{' '}
              {COUNSELLING_DURATION_LABEL} for Career, Domain, or Future calls on Meet or phone.{' '}
              <Link to="/counselling" className="text-educture-orange font-semibold hover:underline">
                Book a guidance call
              </Link>
            </li>
            <li>
              <strong className="text-gray-800">Interview preparation</strong> — ₹{INTERVIEW_PREP_PRICE_INR}{' '}
              {INTERVIEW_PREP_DURATION_LABEL} for a live mock interview on Google Meet.{' '}
              <Link to="/counselling/interview-prep" className="text-educture-orange font-semibold hover:underline">
                Book mock interview
              </Link>
            </li>
            <li>
              <strong className="text-gray-800">AI Resume + Profile Review</strong> — free gap analysis & improvement
              tips.{' '}
              <Link to="/ai?tool=resume-review" className="text-educture-orange font-semibold hover:underline">
                Try now
              </Link>
            </li>
            <li>
              <strong className="text-gray-800">AI Opportunity Matcher</strong> — internships, scholarships, courses
              & competitions matched to your profile.{' '}
              <Link to="/ai?tool=opportunity-matcher" className="text-educture-orange font-semibold hover:underline">
                Try now
              </Link>
            </li>
            <li>
              <strong className="text-gray-800">Internship opportunities</strong> — coming soon.{' '}
              <Link to="/counselling" className="text-educture-orange font-semibold hover:underline">
                See career offerings
              </Link>
            </li>
            <li>
              <strong className="text-gray-800">Campus stories</strong> — free, student-written experiences on
              academics, campus life & placements.{' '}
              <Link to="/universities" className="text-educture-orange font-semibold hover:underline">
                Browse stories
              </Link>
            </li>
            <li>
              <strong className="text-gray-800">Campus connect</strong> — coming soon for SGT, GD Goenka &
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

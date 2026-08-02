import { PageShell } from '../components/layout/PageShell'
import { PricingCards } from '../components/marketing/PricingCards'
import { ContactSection } from '../components/marketing/MarketingSections'
import { TRIAL_DAYS, pricingCategoryOrder, categoryPricing, formatCategoryPlanPrices } from '../data/pricingPlans'

export function PricingPage() {
  return (
    <PageShell className="bg-white">
      <section className="bg-sky-50/80 py-14 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.25em]">Services</p>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1a1a1a] mt-3">
            Services &{' '}
            <span className="font-script text-educture-orange text-4xl sm:text-5xl">pricing</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-5 max-w-2xl mx-auto leading-relaxed">
            Three plans per track — Skills, Professional, and Academic. {TRIAL_DAYS}-day trial, monthly, or 3-month
            bundle. Sign in, pick a live class, then pay at checkout (Cashfree) when you enroll.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-sky-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <PricingCards layout="all" />
        </div>
      </section>

      <section className="py-12 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-3xl border-[3px] border-orange-100 bg-white p-8 shadow-sm">
          <h2 className="font-display text-lg text-[#1a1a1a]">Per-category pricing</h2>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {pricingCategoryOrder
              .map((id) => `${categoryPricing[id].title}: ${formatCategoryPlanPrices(id)}`)
              .join(' · ')}
            . Starter starts your {TRIAL_DAYS}-day trial after you pick a class; Growth and Premium are chosen at class checkout.
          </p>
        </div>
      </section>

      <ContactSection />
    </PageShell>
  )
}

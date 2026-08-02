import { useState } from 'react'
import {
  categoryPricing,
  pricingCategoryOrder,
  formatInr,
  TRIAL_DAYS,
  type PricingCategoryId,
} from '../../data/pricingPlans'
import { CategoryPlanCards } from '../pricing/CategoryPlanCards'
import { PaymentFlowGuide } from '../checkout/PaymentFlowGuide'

type Props = {
  layout?: 'tabs' | 'all'
}

export function PricingCards({ layout = 'tabs' }: Props) {
  const [activeCategory, setActiveCategory] = useState<PricingCategoryId>('skills')

  if (layout === 'all') {
    return (
      <div className="space-y-14 lg:space-y-20">
        <PaymentFlowGuide context="marketing" />
        {pricingCategoryOrder.map((categoryId) => {
          const config = categoryPricing[categoryId]
          return (
            <div key={categoryId}>
              <div className="text-left mb-8">
                <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.2em]">Pricing</p>
                <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] mt-2">{config.title}</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {TRIAL_DAYS}-day trial · {formatInr(config.monthlyInr)}/month · {formatInr(config.threeMonthInr)} for
                  3 months
                </p>
              </div>
              <CategoryPlanCards categoryId={categoryId} mode="marketing" />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <PaymentFlowGuide context="marketing" />
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {pricingCategoryOrder.map((id) => {
          const active = id === activeCategory
          const label =
            id === 'skills' ? 'Skills' : id === 'professional' ? 'Professional' : 'Academic'
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border-[3px] transition-colors ${
                active
                  ? 'bg-educture-orange text-white border-educture-orange shadow-[0_8px_24px_rgba(243,112,33,0.35)]'
                  : 'bg-white text-gray-700 border-orange-100 hover:border-educture-orange hover:text-educture-orange'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
      <p className="text-center text-sm text-gray-600 mb-8">
        {categoryPricing[activeCategory].title} — {TRIAL_DAYS}-day trial then {formatInr(categoryPricing[activeCategory].monthlyInr)}/mo
        or {formatInr(categoryPricing[activeCategory].threeMonthInr)} / 3 mo
      </p>
      <CategoryPlanCards categoryId={activeCategory} mode="marketing" />
    </>
  )
}

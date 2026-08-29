import { Link } from 'react-router-dom'
import { Gem, Paperclip, Building2, ArrowUpRight } from 'lucide-react'
import {
  formatInr,
  type PricingCategoryId,
  type PricingPaymentTier,
} from '../../data/pricingPlans'
import { planCardHint } from '../../data/paymentFlow'
import { useCategoryPricing } from '../../context/CategoryPricingContext'

const MARKETING_BROWSE_PATH = '/student/browse'

const categoryImages: Record<PricingCategoryId, string[]> = {
  skills: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
  ],
  professional: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  ],
  academic: [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
  ],
}

type Props = {
  categoryId: PricingCategoryId
  mode?: 'marketing' | 'checkout'
  classId?: string
  onSelectPay?: (tier: PricingPaymentTier) => void
}

export function CategoryPlanCards({
  categoryId,
  mode = 'marketing',
  classId,
  onSelectPay,
}: Props) {
  const { pricing } = useCategoryPricing()
  const config = pricing[categoryId]
  const images = categoryImages[categoryId]

  const tiers = [
    {
      key: 'monthly' as const,
      name: 'Monthly',
      imageTag: '1 month',
      imageTagClass: 'bg-sky-600',
      price: formatInr(config.monthlyInr),
      priceNote: 'per month',
      desc: `Pay ${formatInr(config.monthlyInr)} upfront for one month of ${config.title.toLowerCase()} — live Google Meet with peers & mentor.`,
      features: [
        'Full month of live sessions',
        'Pay now to start',
        'Projects & mentor feedback',
        'Renew monthly when you continue',
      ],
      cta: mode === 'checkout' ? 'Choose 1 month' : 'Browse sessions',
      tier: 'monthly' as const,
      icon: Paperclip,
      iconBg: 'bg-sky-100 border-sky-200',
      iconColor: 'text-sky-600',
      image: images[0],
    },
    {
      key: 'three-month' as const,
      name: '3 Months',
      imageTag: 'Popular',
      imageTagClass: 'bg-educture-orange',
      price: formatInr(config.threeMonthInr),
      priceNote: '3 months',
      desc: `One payment for three months of ${config.title.toLowerCase()} with your peer group.`,
      features: [
        '3 months bundled access',
        'Same live Meet collaboration',
        'Better than paying month-by-month',
        'Choose 3 months at checkout',
      ],
      cta: mode === 'checkout' ? 'Choose 3 months' : 'Browse sessions',
      tier: 'three-month' as const,
      icon: Gem,
      iconBg: 'bg-[#fff4eb] border-orange-200',
      iconColor: 'text-educture-orange',
      image: images[1],
    },
    {
      key: 'six-month' as const,
      name: '6 Months',
      imageTag: 'Best value',
      imageTagClass: 'bg-violet-600',
      price: formatInr(config.sixMonthInr),
      priceNote: '6 months',
      desc: `Six months of ${config.title.toLowerCase()} — the best value for steady learners.`,
      features: [
        '6 months bundled access',
        'Lowest effective monthly cost',
        'Same live Meet collaboration',
        'Choose 6 months at checkout',
      ],
      cta: mode === 'checkout' ? 'Choose 6 months' : 'Browse sessions',
      tier: 'six-month' as const,
      icon: Building2,
      iconBg: 'bg-violet-50 border-violet-200',
      iconColor: 'text-violet-700',
      image: images[2],
    },
  ]

  const handlePayTier = (tier: PricingPaymentTier) => {
    if (mode === 'checkout' && onSelectPay) {
      onSelectPay(tier)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch pricing-card-grid">
      {tiers.map((plan) => {
        const Icon = plan.icon
        const isCheckoutPayCard = mode === 'checkout'

        const openCheckoutTier = () => {
          handlePayTier(plan.tier)
        }

        return (
          <article
            key={plan.key}
            role={isCheckoutPayCard ? 'button' : undefined}
            tabIndex={isCheckoutPayCard ? 0 : undefined}
            onClick={isCheckoutPayCard ? openCheckoutTier : undefined}
            onKeyDown={
              isCheckoutPayCard
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openCheckoutTier()
                    }
                  }
                : undefined
            }
            className={`pricing-card gsap-card-in group rounded-3xl overflow-hidden text-left flex flex-col border-[3px] border-orange-100 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-educture-orange hover:bg-[#fff4eb] hover:scale-[1.02] lg:hover:scale-[1.04] hover:shadow-[0_20px_48px_rgba(243,112,33,0.18)] ${isCheckoutPayCard ? 'cursor-pointer' : ''}`}
          >
            <div className="relative h-36 overflow-hidden border-b-[3px] border-orange-50 group-hover:border-educture-orange/30 transition-colors">
              <img
                src={plan.image}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span
                className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full shadow-sm ${plan.imageTagClass}`}
              >
                {plan.imageTag}
              </span>
            </div>
            <div className="p-6 sm:p-7 flex flex-col flex-1">
              <div className="flex items-center gap-3 sm:gap-4 mb-5">
                <div
                  className={`w-12 h-12 shrink-0 rounded-2xl border-[3px] flex items-center justify-center transition-transform group-hover:scale-110 ${plan.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xl sm:text-2xl text-[#1a1a1a] leading-tight">{plan.name}</p>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-educture-orange mt-1">
                    {plan.imageTag}
                  </p>
                </div>
              </div>
              <p className="font-display text-4xl sm:text-[2.75rem] text-[#1a1a1a] leading-none">{plan.price}</p>
              {plan.priceNote && (
                <p className="text-xs font-semibold text-educture-orange mt-1">{plan.priceNote}</p>
              )}
              <p className="text-sm text-gray-600 mt-3 mb-5 leading-relaxed">{plan.desc}</p>
              <ul className="space-y-2 mb-4 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-educture-orange shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {planCardHint(plan.key, mode) ? (
                <p className="text-xs text-gray-500 mb-4 leading-relaxed border-t border-orange-50 pt-3">
                  {planCardHint(plan.key, mode)}
                </p>
              ) : null}
              {isCheckoutPayCard ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    openCheckoutTier()
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold transition-all border-[3px] border-sky-200 text-[#1a1a1a] bg-white group-hover:bg-educture-orange group-hover:text-white group-hover:border-educture-orange group-hover:shadow-[0_10px_28px_rgba(243,112,33,0.4)]"
                >
                  {plan.cta}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  to="/sign-in"
                  state={{ from: MARKETING_BROWSE_PATH }}
                  className="inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold transition-all border-[3px] border-sky-200 text-[#1a1a1a] bg-white group-hover:bg-educture-orange group-hover:text-white group-hover:border-educture-orange w-full"
                >
                  {plan.cta}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

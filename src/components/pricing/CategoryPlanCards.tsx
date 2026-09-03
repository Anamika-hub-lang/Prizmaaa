import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Building2,
  Check,
  Gem,
  Paperclip,
  Target,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  formatInr,
  type PricingCategoryId,
  type PricingPaymentTier,
} from '../../data/pricingPlans'
import {
  coursePlanBlueprintOrder,
  coursePlanBlueprints,
  type CoursePlanBlueprint,
} from '../../data/coursePlanBlueprint'
import { useCategoryPricing } from '../../context/CategoryPricingContext'

const MARKETING_BROWSE_PATH = '/student/browse'

const tierMeta: Record<
  PricingPaymentTier,
  {
    badge: string
    badgeClass: string
    icon: LucideIcon
    iconBg: string
    iconColor: string
    cardBg: string
    priceNote: string
  }
> = {
  monthly: {
    badge: 'Crash / Revision',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: Paperclip,
    iconBg: 'bg-sky-100 border-sky-200',
    iconColor: 'text-sky-600',
    cardBg: 'bg-sky-50/80',
    priceNote: 'per month',
  },
  'three-month': {
    badge: 'Learn & Build',
    badgeClass: 'bg-orange-100 text-educture-orange border-orange-200',
    icon: Gem,
    iconBg: 'bg-[#fff4eb] border-orange-200',
    iconColor: 'text-educture-orange',
    cardBg: 'bg-[#fff9f3]',
    priceNote: '3 months',
  },
  'six-month': {
    badge: 'Master & Apply',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
    icon: Building2,
    iconBg: 'bg-violet-50 border-violet-200',
    iconColor: 'text-violet-700',
    cardBg: 'bg-violet-50/70',
    priceNote: '6 months',
  },
}

type Props = {
  categoryId: PricingCategoryId
  mode?: 'marketing' | 'checkout'
  classId?: string
  onSelectPay?: (tier: PricingPaymentTier) => void
}

function priceForTier(
  tier: PricingPaymentTier,
  config: { monthlyInr: number; threeMonthInr: number; sixMonthInr: number },
): number {
  switch (tier) {
    case 'monthly':
      return config.monthlyInr
    case 'three-month':
      return config.threeMonthInr
    case 'six-month':
      return config.sixMonthInr
    default: {
      const _exhaustive: never = tier
      return _exhaustive
    }
  }
}

function PlanDetailPanel({
  blueprint,
  categoryTitle,
  priceLabel,
  mode,
  onClose,
  onChoose,
}: {
  blueprint: CoursePlanBlueprint
  categoryTitle: string
  priceLabel: string
  mode: 'marketing' | 'checkout'
  onClose: () => void
  onChoose: () => void
}) {
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close plan details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border-[3px] border-orange-100 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.25)]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-white/95 backdrop-blur px-5 pt-5 pb-3 border-b border-orange-50">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-educture-orange">
              {blueprint.type}
            </p>
            <h2 id={titleId} className="font-display text-2xl text-[#1a1a1a] mt-1">
              {blueprint.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {categoryTitle} · {priceLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-orange-100 p-2 text-gray-500 hover:bg-orange-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5 text-left">
          <div className="rounded-2xl border border-orange-100 bg-[#fff9f3] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
              Depth · Purpose
            </p>
            <p className="text-sm font-semibold text-[#1a1a1a] mt-1">
              {blueprint.depthLabel} · {blueprint.mainPurpose}
            </p>
          </div>

          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-educture-orange">
              Motive
            </p>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{blueprint.motive}</p>
          </section>

          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-educture-orange inline-flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Goal
            </p>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{blueprint.goal}</p>
          </section>

          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-educture-orange">
              What will be taught (syllabus depth)
            </p>
            <ul className="mt-3 space-y-2">
              {blueprint.syllabusDepth.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-educture-orange shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
              Outcome
            </p>
            <p className="text-sm text-emerald-950 mt-2 leading-relaxed">{blueprint.outcome}</p>
          </section>

          {mode === 'checkout' ? (
            <button
              type="button"
              onClick={onChoose}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold bg-educture-orange text-white hover:bg-educture-orange-dark"
            >
              Choose {blueprint.durationLabel}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/sign-in"
              state={{ from: MARKETING_BROWSE_PATH }}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold bg-educture-orange text-white hover:bg-educture-orange-dark"
            >
              Browse sessions
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function CategoryPlanCards({
  categoryId,
  mode = 'marketing',
  onSelectPay,
}: Props) {
  const { pricing } = useCategoryPricing()
  const config = pricing[categoryId]
  const [openTier, setOpenTier] = useState<PricingPaymentTier | null>(null)

  const openBlueprint = openTier ? coursePlanBlueprints[openTier] : null

  return (
    <>
      <div className="grid md:grid-cols-3 gap-5 lg:gap-6 items-stretch pricing-card-grid">
        {coursePlanBlueprintOrder.map((tier) => {
          const blueprint = coursePlanBlueprints[tier]
          const meta = tierMeta[tier]
          const Icon = meta.icon
          const price = formatInr(priceForTier(tier, config))
          const isCheckout = mode === 'checkout'

          return (
            <article
              key={tier}
              role="button"
              tabIndex={0}
              onClick={() => setOpenTier(tier)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setOpenTier(tier)
                }
              }}
              className={`pricing-card gsap-card-in group rounded-3xl text-left flex flex-col border-2 border-orange-100/90 ${meta.cardBg} p-6 sm:p-7 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-educture-orange hover:shadow-[0_16px_40px_rgba(243,112,33,0.14)] cursor-pointer`}
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <div
                  className={`w-11 h-11 shrink-0 rounded-2xl border-2 flex items-center justify-center ${meta.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border ${meta.badgeClass}`}
                >
                  {meta.badge}
                </span>
              </div>

              <p className="font-display text-xl sm:text-2xl text-[#1a1a1a] leading-tight">
                {blueprint.name}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1.5">{blueprint.type}</p>

              <p className="font-display text-3xl sm:text-4xl text-[#1a1a1a] leading-none mt-5">
                {price}
              </p>
              <p className="text-xs font-semibold text-educture-orange mt-1">{meta.priceNote}</p>

              <p className="text-sm text-gray-600 mt-4 leading-relaxed line-clamp-3">
                {blueprint.motive}
              </p>

              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mt-4 mb-2">
                {blueprint.depthLabel} · {blueprint.mainPurpose}
              </p>

              <ul className="space-y-2 mb-6 flex-1">
                {blueprint.cardHighlights.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-educture-orange shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenTier(tier)
                }}
                className="inline-flex w-full items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all border-2 border-orange-200/80 bg-white text-[#1a1a1a] group-hover:bg-educture-orange group-hover:text-white group-hover:border-educture-orange"
              >
                {isCheckout ? 'See what you’ll learn' : 'See plan syllabus'}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </article>
          )
        })}
      </div>

      {openBlueprint && openTier ? (
        <PlanDetailPanel
          blueprint={openBlueprint}
          categoryTitle={config.title}
          priceLabel={`${formatInr(priceForTier(openTier, config))} · ${tierMeta[openTier].priceNote}`}
          mode={mode}
          onClose={() => setOpenTier(null)}
          onChoose={() => {
            onSelectPay?.(openTier)
            setOpenTier(null)
          }}
        />
      ) : null}
    </>
  )
}

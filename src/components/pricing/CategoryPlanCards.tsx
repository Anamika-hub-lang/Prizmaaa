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

const tierMeta: Record<
  PricingPaymentTier,
  {
    imageTag: string
    imageTagClass: string
    icon: LucideIcon
    iconBg: string
    iconColor: string
    priceNote: string
  }
> = {
  monthly: {
    imageTag: 'Crash / Revision',
    imageTagClass: 'bg-sky-600',
    icon: Paperclip,
    iconBg: 'bg-sky-100 border-sky-200',
    iconColor: 'text-sky-600',
    priceNote: 'per month',
  },
  'three-month': {
    imageTag: 'Learn & Build',
    imageTagClass: 'bg-educture-orange',
    icon: Gem,
    iconBg: 'bg-[#fff4eb] border-orange-200',
    iconColor: 'text-educture-orange',
    priceNote: '3 months',
  },
  'six-month': {
    imageTag: 'Master & Apply',
    imageTagClass: 'bg-violet-600',
    icon: Building2,
    iconBg: 'bg-violet-50 border-violet-200',
    iconColor: 'text-violet-700',
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
  const images = categoryImages[categoryId]
  const [openTier, setOpenTier] = useState<PricingPaymentTier | null>(null)

  const openBlueprint = openTier ? coursePlanBlueprints[openTier] : null

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch pricing-card-grid">
        {coursePlanBlueprintOrder.map((tier, index) => {
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
              className="pricing-card gsap-card-in group rounded-3xl overflow-hidden text-left flex flex-col border-[3px] border-orange-100 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-educture-orange hover:bg-[#fff4eb] hover:scale-[1.02] lg:hover:scale-[1.04] hover:shadow-[0_20px_48px_rgba(243,112,33,0.18)] cursor-pointer"
            >
              <div className="relative h-36 overflow-hidden border-b-[3px] border-orange-50 group-hover:border-educture-orange/30 transition-colors">
                <img
                  src={images[index] ?? images[0]}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span
                  className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full shadow-sm ${meta.imageTagClass}`}
                >
                  {meta.imageTag}
                </span>
              </div>
              <div className="p-6 sm:p-7 flex flex-col flex-1">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div
                    className={`w-12 h-12 shrink-0 rounded-2xl border-[3px] flex items-center justify-center transition-transform group-hover:scale-110 ${meta.iconBg}`}
                  >
                    <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-xl sm:text-2xl text-[#1a1a1a] leading-tight">
                      {blueprint.name}
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-educture-orange mt-1">
                      {blueprint.type}
                    </p>
                  </div>
                </div>
                <p className="font-display text-4xl sm:text-[2.75rem] text-[#1a1a1a] leading-none">
                  {price}
                </p>
                <p className="text-xs font-semibold text-educture-orange mt-1">{meta.priceNote}</p>
                <p className="text-sm text-gray-600 mt-3 mb-4 leading-relaxed line-clamp-3">
                  {blueprint.motive}
                </p>
                <p className="text-[11px] font-semibold text-gray-500 mb-2">
                  {blueprint.depthLabel} · {blueprint.mainPurpose}
                </p>
                <ul className="space-y-2 mb-5 flex-1">
                  {blueprint.cardHighlights.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-educture-orange shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenTier(tier)
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold transition-all border-[3px] border-sky-200 text-[#1a1a1a] bg-white group-hover:bg-educture-orange group-hover:text-white group-hover:border-educture-orange group-hover:shadow-[0_10px_28px_rgba(243,112,33,0.4)]"
                >
                  {isCheckout ? 'See what you’ll learn' : 'See plan syllabus'}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
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

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ListTree } from 'lucide-react'
import {
  coursePlanBlueprintOrder,
  coursePlanBlueprints,
} from '../../data/coursePlanBlueprint'
import type { PricingPaymentTier } from '../../data/pricingPlans'
import {
  fetchStudentTeachingPlans,
  type TeachingPlanRow,
} from '../../lib/classTeachingPlanApi'

const tierLabels: Record<PricingPaymentTier, string> = {
  monthly: '1 Month',
  'three-month': '3 Month',
  'six-month': '6 Month',
}

function isPlanTier(value: string | null | undefined): value is PricingPaymentTier {
  return value === 'monthly' || value === 'three-month' || value === 'six-month'
}

export function StudentTeachingPlanPanel({
  classId,
  preferredTier,
}: {
  classId: string
  preferredTier?: string | null
}) {
  const { getToken } = useAuth()
  const [plans, setPlans] = useState<TeachingPlanRow[]>([])
  const [activeTier, setActiveTier] = useState<PricingPaymentTier>(
    isPlanTier(preferredTier) ? preferredTier : 'monthly',
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isPlanTier(preferredTier)) setActiveTier(preferredTier)
  }, [preferredTier])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchStudentTeachingPlans(getToken, classId)
      .then((data) => {
        if (cancelled) return
        setPlans(data.plans)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load teaching plan')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [classId, getToken])

  const activePlan = useMemo(
    () => plans.find((p) => p.tier === activeTier),
    [plans, activeTier],
  )
  const blueprint = coursePlanBlueprints[activeTier]

  if (loading) {
    return <p className="text-sm text-gray-500">Loading what you’ll learn…</p>
  }

  if (error || !activePlan) {
    return null
  }

  return (
    <section className="rounded-2xl border border-orange-100 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-educture-orange shrink-0">
          <ListTree className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-educture-orange">
            What you’ll learn
          </p>
          <h3 className="font-semibold text-[#1d1d1d] mt-0.5">
            {blueprint.name}
            {activePlan.customized ? ' · set by your mentor' : ''}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{blueprint.mainPurpose}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {coursePlanBlueprintOrder.map((tier) => {
          const active = activeTier === tier
          return (
            <button
              key={tier}
              type="button"
              onClick={() => setActiveTier(tier)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                active
                  ? 'border-educture-orange bg-educture-orange/10 text-educture-orange'
                  : 'border-gray-200 text-gray-600 hover:border-orange-200'
              }`}
            >
              {tierLabels[tier]}
            </button>
          )
        })}
      </div>

      <ul className="space-y-2">
        {activePlan.topics.map((topic) => (
          <li
            key={topic}
            className="text-sm text-gray-700 flex gap-2 leading-snug before:content-[''] before:mt-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-educture-orange before:shrink-0"
          >
            {topic}
          </li>
        ))}
      </ul>

      {activePlan.notes ? (
        <p className="text-xs text-gray-500 bg-orange-50/80 border border-orange-100 rounded-xl px-3 py-2">
          {activePlan.notes}
        </p>
      ) : null}
    </section>
  )
}

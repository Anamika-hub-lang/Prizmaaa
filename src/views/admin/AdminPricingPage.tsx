'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { useCategoryPricing } from '../../context/CategoryPricingContext'
import {
  defaultCategoryPricing,
  formatInr,
  type CategoryPricingMap,
  type PricingCategoryId,
} from '../../data/pricingPlans'
import { ADMIN_PRICING_CATEGORIES, saveAdminPricing } from '../../lib/categoryPricingApi'

function clonePricing(src: CategoryPricingMap): CategoryPricingMap {
  return {
    skills: { ...src.skills },
    professional: { ...src.professional },
    academic: { ...src.academic },
  }
}

export function AdminPricingPage() {
  const { getToken } = useAuth()
  const { pricing: livePricing, loading: liveLoading, refresh } = useCategoryPricing()
  const [draft, setDraft] = useState<CategoryPricingMap>(() => clonePricing(defaultCategoryPricing))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!liveLoading) setDraft(clonePricing(livePricing))
  }, [livePricing, liveLoading])

  function setAmount(
    id: PricingCategoryId,
    field: 'monthlyInr' | 'threeMonthInr' | 'sixMonthInr',
    value: string,
  ) {
    const n = Number(value.replace(/[^\d]/g, ''))
    setDraft((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Number.isFinite(n) ? n : 0,
      },
    }))
    setSaved(false)
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      for (const { id } of ADMIN_PRICING_CATEGORIES) {
        const row = draft[id]
        for (const amount of [row.monthlyInr, row.threeMonthInr, row.sixMonthInr]) {
          if (!Number.isFinite(amount) || amount < 1) {
            throw new Error(`${id}: enter valid prices (₹1 or more)`)
          }
        }
      }
      await saveAdminPricing(getToken, draft)
      await refresh()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save pricing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Course pricing"
        subtitle="Set plan prices for Academic, Professional, and Skills. Changes apply to checkout and marketing cards."
      />
      <form onSubmit={(e) => void onSave(e)} className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {liveLoading ? <p className="text-sm text-gray-500">Loading current prices…</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-700">Prices saved. Students will see the new amounts.</p> : null}

        <div className="grid gap-5">
          {ADMIN_PRICING_CATEGORIES.map(({ id, label }) => {
            const row = draft[id]
            return (
              <section
                key={id}
                className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4 text-left"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{row.title}</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">Monthly (₹)</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={row.monthlyInr || ''}
                      onChange={(e) => setAmount(id, 'monthlyInr', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-educture-orange"
                      required
                    />
                    <span className="text-[11px] text-gray-400">{formatInr(row.monthlyInr || 0)}/mo</span>
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">3 months (₹)</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={row.threeMonthInr || ''}
                      onChange={(e) => setAmount(id, 'threeMonthInr', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-educture-orange"
                      required
                    />
                    <span className="text-[11px] text-gray-400">{formatInr(row.threeMonthInr || 0)}</span>
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">6 months (₹)</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={row.sixMonthInr || ''}
                      onChange={(e) => setAmount(id, 'sixMonthInr', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-educture-orange"
                      required
                    />
                    <span className="text-[11px] text-gray-400">{formatInr(row.sixMonthInr || 0)}</span>
                  </label>
                </div>
              </section>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || liveLoading}
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-2.5 text-sm bg-educture-orange text-white hover:bg-educture-orange-dark disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save prices'}
          </button>
          <button
            type="button"
            className="text-sm font-medium text-gray-600 hover:text-educture-orange"
            onClick={() => {
              setDraft(clonePricing(livePricing))
              setError(null)
              setSaved(false)
            }}
          >
            Reset edits
          </button>
        </div>
      </form>
    </div>
  )
}

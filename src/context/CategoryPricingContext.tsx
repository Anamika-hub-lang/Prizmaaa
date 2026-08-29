'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  defaultCategoryPricing,
  setLiveCategoryPricing,
  type CategoryPricingMap,
} from '../data/pricingPlans'

type CategoryPricingContextValue = {
  pricing: CategoryPricingMap
  loading: boolean
  refresh: () => Promise<void>
}

const CategoryPricingContext = createContext<CategoryPricingContextValue | null>(null)

function normalizePricing(raw: unknown): CategoryPricingMap {
  const base: CategoryPricingMap = {
    skills: { ...defaultCategoryPricing.skills },
    professional: { ...defaultCategoryPricing.professional },
    academic: { ...defaultCategoryPricing.academic },
  }
  if (!raw || typeof raw !== 'object') return base
  const obj = raw as Record<string, Partial<CategoryPricingMap[keyof CategoryPricingMap]>>
  for (const id of ['skills', 'professional', 'academic'] as const) {
    const row = obj[id]
    if (!row) continue
    base[id] = {
      title: typeof row.title === 'string' && row.title ? row.title : base[id].title,
      monthlyInr: Number(row.monthlyInr) > 0 ? Math.round(Number(row.monthlyInr)) : base[id].monthlyInr,
      threeMonthInr:
        Number(row.threeMonthInr) > 0 ? Math.round(Number(row.threeMonthInr)) : base[id].threeMonthInr,
      sixMonthInr:
        Number(row.sixMonthInr) > 0 ? Math.round(Number(row.sixMonthInr)) : base[id].sixMonthInr,
      image: typeof row.image === 'string' && row.image ? row.image : base[id].image,
    }
  }
  return base
}

export function CategoryPricingProvider({ children }: { children: ReactNode }) {
  const [pricing, setPricing] = useState<CategoryPricingMap>(defaultCategoryPricing)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pricing')
      const data = (await res.json()) as { pricing?: unknown }
      const next = normalizePricing(data.pricing)
      setPricing(next)
      setLiveCategoryPricing(next)
    } catch {
      setPricing(defaultCategoryPricing)
      setLiveCategoryPricing(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(() => ({ pricing, loading, refresh }), [pricing, loading, refresh])

  return <CategoryPricingContext.Provider value={value}>{children}</CategoryPricingContext.Provider>
}

export function useCategoryPricing(): CategoryPricingContextValue {
  const ctx = useContext(CategoryPricingContext)
  if (!ctx) {
    return {
      pricing: defaultCategoryPricing,
      loading: false,
      refresh: async () => undefined,
    }
  }
  return ctx
}

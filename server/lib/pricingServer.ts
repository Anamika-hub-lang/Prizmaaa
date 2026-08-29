/** Server-side category pricing — DB when available, else built-in defaults. */
import type { SupabaseClient } from '@supabase/supabase-js'

/** Legacy trial length for existing trial checkout routes. */
export const TRIAL_DAYS = 7

export type PricingCategoryId = 'skills' | 'professional' | 'academic'

export type CategoryPricing = {
  title: string
  monthlyInr: number
  threeMonthInr: number
  sixMonthInr: number
  image: string
}

export type CategoryPricingMap = Record<PricingCategoryId, CategoryPricing>

export const DEFAULT_CATEGORY_PRICING: CategoryPricingMap = {
  skills: {
    title: 'Skills Sessions',
    monthlyInr: 999,
    threeMonthInr: 2499,
    sixMonthInr: 4999,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  },
  professional: {
    title: 'Professional Sessions',
    monthlyInr: 1499,
    threeMonthInr: 3899,
    sixMonthInr: 7499,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  },
  academic: {
    title: 'Academic Sessions',
    monthlyInr: 599,
    threeMonthInr: 1599,
    sixMonthInr: 2999,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
  },
}

function isCategoryId(id: string): id is PricingCategoryId {
  return id === 'skills' || id === 'professional' || id === 'academic'
}

export function amountFromPricing(
  pricing: CategoryPricingMap,
  categoryId: string,
  tier: 'monthly' | 'three-month' | 'six-month',
): number {
  const row = isCategoryId(categoryId) ? pricing[categoryId] : pricing.skills
  switch (tier) {
    case 'monthly':
      return row.monthlyInr
    case 'three-month':
      return row.threeMonthInr
    case 'six-month':
      return row.sixMonthInr
    default: {
      const _exhaustive: never = tier
      return _exhaustive
    }
  }
}

/** Sync fallback — prefer resolveServerPaymentAmount when Supabase is available. */
export function serverPaymentAmount(
  categoryId: string,
  tier: 'monthly' | 'three-month' | 'six-month',
): number {
  return amountFromPricing(DEFAULT_CATEGORY_PRICING, categoryId, tier)
}

export async function fetchCategoryPricingMap(supabase: SupabaseClient): Promise<CategoryPricingMap> {
  const { data, error } = await supabase
    .from('category_pricing')
    .select('category_id, title, monthly_inr, three_month_inr, six_month_inr, image')

  if (error) throw error

  const next: CategoryPricingMap = {
    skills: { ...DEFAULT_CATEGORY_PRICING.skills },
    professional: { ...DEFAULT_CATEGORY_PRICING.professional },
    academic: { ...DEFAULT_CATEGORY_PRICING.academic },
  }

  for (const row of data ?? []) {
    const id = String(row.category_id ?? '')
    if (!isCategoryId(id)) continue
    next[id] = {
      title: String(row.title ?? next[id].title),
      monthlyInr: Number(row.monthly_inr) || next[id].monthlyInr,
      threeMonthInr: Number(row.three_month_inr) || next[id].threeMonthInr,
      sixMonthInr: Number(row.six_month_inr) || next[id].sixMonthInr,
      image: String(row.image ?? next[id].image),
    }
  }

  return next
}

export async function resolveServerPaymentAmount(
  supabase: SupabaseClient | null,
  categoryId: string,
  tier: 'monthly' | 'three-month' | 'six-month',
): Promise<number> {
  if (!supabase) return serverPaymentAmount(categoryId, tier)
  try {
    const pricing = await fetchCategoryPricingMap(supabase)
    return amountFromPricing(pricing, categoryId, tier)
  } catch {
    return serverPaymentAmount(categoryId, tier)
  }
}

export async function upsertCategoryPricing(
  supabase: SupabaseClient,
  pricing: CategoryPricingMap,
  updatedByClerkId: string,
): Promise<void> {
  const rows = (Object.keys(pricing) as PricingCategoryId[]).map((category_id) => ({
    category_id,
    title: pricing[category_id].title,
    monthly_inr: pricing[category_id].monthlyInr,
    three_month_inr: pricing[category_id].threeMonthInr,
    six_month_inr: pricing[category_id].sixMonthInr,
    image: pricing[category_id].image,
    updated_at: new Date().toISOString(),
    updated_by_clerk_id: updatedByClerkId,
  }))

  const { error } = await supabase.from('category_pricing').upsert(rows, { onConflict: 'category_id' })
  if (error) throw error
}

import type { ClassCategoryId } from './classCatalog'

/** Legacy trial length — trial is no longer offered on pricing cards. */
export const TRIAL_DAYS = 7

export type PricingCategoryId = ClassCategoryId

export type PricingPaymentTier = 'monthly' | 'three-month' | 'six-month'

export type PricingPaymentSelection = {
  categoryId: PricingCategoryId
  tier: PricingPaymentTier
}

export type CategoryPricing = {
  title: string
  monthlyInr: number
  threeMonthInr: number
  sixMonthInr: number
  image: string
}

export const categoryPricing: Record<PricingCategoryId, CategoryPricing> = {
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

export const pricingCategoryOrder: PricingCategoryId[] = ['skills', 'professional', 'academic']

export function getPaymentAmount(selection: PricingPaymentSelection): number {
  const p = categoryPricing[selection.categoryId]
  switch (selection.tier) {
    case 'monthly':
      return p.monthlyInr
    case 'three-month':
      return p.threeMonthInr
    case 'six-month':
      return p.sixMonthInr
    default: {
      const _exhaustive: never = selection.tier
      return _exhaustive
    }
  }
}

export function getPaymentLabel(selection: PricingPaymentSelection): string {
  const p = categoryPricing[selection.categoryId]
  switch (selection.tier) {
    case 'monthly':
      return `${p.title} · 1 month`
    case 'three-month':
      return `${p.title} · 3 months`
    case 'six-month':
      return `${p.title} · 6 months`
    default: {
      const _exhaustive: never = selection.tier
      return _exhaustive
    }
  }
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function getCategoryMonthlyInr(categoryId: PricingCategoryId): number {
  return categoryPricing[categoryId].monthlyInr
}

export function getCategoryThreeMonthInr(categoryId: PricingCategoryId): number {
  return categoryPricing[categoryId].threeMonthInr
}

export function getCategorySixMonthInr(categoryId: PricingCategoryId): number {
  return categoryPricing[categoryId].sixMonthInr
}

/** One line for browse cards: monthly + 3-month + 6-month bundle prices. */
export function formatCategoryPlanPrices(categoryId: PricingCategoryId): string {
  const p = categoryPricing[categoryId]
  return `${formatInr(p.monthlyInr)}/mo · ${formatInr(p.threeMonthInr)} / 3 mo · ${formatInr(p.sixMonthInr)} / 6 mo`
}

export function formatBrowsePricingSummary(): string {
  const labels: Record<PricingCategoryId, string> = {
    skills: 'Skills',
    professional: 'Professional',
    academic: 'Academic',
  }
  return pricingCategoryOrder
    .map((id) => `${labels[id]} ${formatInr(categoryPricing[id].monthlyInr)}/mo`)
    .join(' · ')
}

import type { ClassCategoryId } from './classCatalog'

export const TRIAL_DAYS = 7

export type PricingCategoryId = ClassCategoryId

export type PricingPaymentTier = 'monthly' | 'three-month'

export type PricingPaymentSelection = {
  categoryId: PricingCategoryId
  tier: PricingPaymentTier
}

export type CategoryPricing = {
  title: string
  monthlyInr: number
  threeMonthInr: number
  image: string
}

export const categoryPricing: Record<PricingCategoryId, CategoryPricing> = {
  skills: {
    title: 'Skills Based Classes',
    monthlyInr: 999,
    threeMonthInr: 2499,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  },
  professional: {
    title: 'Professional Classes',
    monthlyInr: 1499,
    threeMonthInr: 3899,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  },
  academic: {
    title: 'Academic Classes',
    monthlyInr: 599,
    threeMonthInr: 1599,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
  },
}

export const pricingCategoryOrder: PricingCategoryId[] = ['skills', 'professional', 'academic']

export function getPaymentAmount(selection: PricingPaymentSelection): number {
  const p = categoryPricing[selection.categoryId]
  return selection.tier === 'monthly' ? p.monthlyInr : p.threeMonthInr
}

export function getPaymentLabel(selection: PricingPaymentSelection): string {
  const p = categoryPricing[selection.categoryId]
  if (selection.tier === 'monthly') {
    return `${p.title} · Monthly`
  }
  return `${p.title} · 3 months`
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

/** One line for browse cards: monthly + 3-month bundle (official plan prices). */
export function formatCategoryPlanPrices(categoryId: PricingCategoryId): string {
  const p = categoryPricing[categoryId]
  return `${formatInr(p.monthlyInr)}/mo · ${formatInr(p.threeMonthInr)} / 3 mo`
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

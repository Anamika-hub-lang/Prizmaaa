/** Server-side pricing mirror (keep in sync with src/data/pricingPlans.ts). */
export const TRIAL_DAYS = 7

const monthly: Record<string, number> = {
  skills: 999,
  professional: 1499,
  academic: 599,
}

const threeMonth: Record<string, number> = {
  skills: 2499,
  professional: 3899,
  academic: 1599,
}

export function serverPaymentAmount(
  categoryId: string,
  tier: 'monthly' | 'three-month',
): number {
  if (tier === 'monthly') return monthly[categoryId] ?? 999
  return threeMonth[categoryId] ?? 2499
}

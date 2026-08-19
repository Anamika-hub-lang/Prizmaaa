/** Server-side pricing mirror (keep in sync with src/data/pricingPlans.ts). */
/** Legacy trial length for existing trial checkout routes. */
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

const sixMonth: Record<string, number> = {
  skills: 4999,
  professional: 7499,
  academic: 2999,
}

export function serverPaymentAmount(
  categoryId: string,
  tier: 'monthly' | 'three-month' | 'six-month',
): number {
  switch (tier) {
    case 'monthly':
      return monthly[categoryId] ?? 999
    case 'three-month':
      return threeMonth[categoryId] ?? 2499
    case 'six-month':
      return sixMonth[categoryId] ?? 4999
    default: {
      const _exhaustive: never = tier
      return _exhaustive
    }
  }
}

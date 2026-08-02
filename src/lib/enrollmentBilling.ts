import { TRIAL_DAYS } from '../data/pricingPlans'
import type { PaymentMethodType, StudentEnrollment } from '../types/enrollment'

export function trialEndDateFromNow(): string {
  const d = new Date()
  d.setDate(d.getDate() + TRIAL_DAYS)
  return d.toISOString()
}

export function daysUntilTrialEnd(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null
  const ms = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

/** Demo auto-billing after trial — production: Cashfree Subscriptions / mandate for recurring debit. */
export function applyTrialBillingRules(enrollments: StudentEnrollment[]): StudentEnrollment[] {
  const now = Date.now()
  return enrollments.map((e) => {
    if (e.billingStatus === 'cancelled') return e
    if (e.billingStatus !== 'trial' || !e.trialEndsAt) return e
    const ended = new Date(e.trialEndsAt).getTime() <= now
    if (!ended) return e
    if (!e.autoRenew) {
      return { ...e, billingStatus: 'cancelled', status: 'draft' }
    }
    return {
      ...e,
      billingStatus: 'active',
      planTier: e.planTier === 'trial' ? 'monthly' : e.planTier,
    }
  })
}

export function maskPaymentLabel(type: PaymentMethodType, raw: string): string {
  const v = raw.trim()
  if (type === 'upi') return v.includes('@') ? v : `${v.slice(0, 4)}…@upi`
  if (type === 'bank') return `Account ···${v.slice(-4)}`
  return `Card ···${v.slice(-4)}`
}

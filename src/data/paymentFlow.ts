import { TRIAL_DAYS } from '../data/pricingPlans'

export type PaymentFlowPath = 'trial' | 'paid-monthly' | 'paid-three-month'

export const checkoutSteps = {
  choose: { n: 1, label: 'Choose plan' },
  pay: { n: 2, label: 'Payment details' },
  dashboard: { n: 3, label: 'Dashboard access' },
} as const

export function planCardHint(key: 'trial' | 'monthly' | 'three-month', mode: 'checkout' | 'marketing') {
  if (key === 'trial') {
    return mode === 'checkout'
      ? `Opens step 2: save UPI/bank/card for auto-pay after ${TRIAL_DAYS}-day trial. No charge today.`
      : `Sign up, pick a class, then add payment method to start ${TRIAL_DAYS}-day trial.`
  }
  if (key === 'monthly') {
    return mode === 'checkout'
      ? 'Opens step 2: pay monthly amount now → class appears on your dashboard.'
      : 'Sign in and enroll in a class to pay for 1 month.'
  }
  return mode === 'checkout'
    ? 'Opens step 2: pay 3-month bundle now → class appears on your dashboard.'
    : 'Sign in and enroll in a class to pay for 3 months.'
}

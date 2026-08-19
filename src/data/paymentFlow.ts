export type PaymentFlowPath = 'paid-monthly' | 'paid-three-month' | 'paid-six-month'

export const checkoutSteps = {
  choose: { n: 1, label: 'Choose plan' },
  pay: { n: 2, label: 'Payment details' },
  dashboard: { n: 3, label: 'Dashboard access' },
} as const

export function planCardHint(
  key: 'monthly' | 'three-month' | 'six-month',
  mode: 'checkout' | 'marketing',
) {
  if (key === 'monthly') {
    return mode === 'checkout'
      ? 'Opens step 2: pay ₹999/month now → class appears on your dashboard.'
      : 'Sign in, pick a session, and pay for 1 month.'
  }
  if (key === 'three-month') {
    return mode === 'checkout'
      ? 'Opens step 2: pay 3-month bundle now → class appears on your dashboard.'
      : 'Sign in and enroll in a peer session to pay for 3 months upfront.'
  }
  return mode === 'checkout'
    ? 'Opens step 2: pay 6-month bundle now → best value on your dashboard.'
    : 'Sign in and enroll in a peer session to pay for 6 months upfront.'
}

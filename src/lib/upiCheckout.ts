import { isCashfreeClientEnabled } from './cashfreeCheckout'

/** When true, checkout shows UPI QR instead of opening Cashfree (Cashfree code stays in repo). */
export function isUpiQrCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_UPI_QR_CHECKOUT !== 'false'
}

export function shouldUseCashfreeCheckout(): boolean {
  return isCashfreeClientEnabled() && !isUpiQrCheckoutEnabled()
}

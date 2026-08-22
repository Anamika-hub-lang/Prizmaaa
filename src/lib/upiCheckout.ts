import { isCashfreeClientEnabled } from './cashfreeCheckout'

/** UPI QR checkout is disabled by default. Set NEXT_PUBLIC_UPI_QR_CHECKOUT=true to re-enable. */
export function isUpiQrCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_UPI_QR_CHECKOUT === 'true'
}

export function shouldUseCashfreeCheckout(): boolean {
  return isCashfreeClientEnabled() && !isUpiQrCheckoutEnabled()
}

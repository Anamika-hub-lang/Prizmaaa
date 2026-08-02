import { load } from '@cashfreepayments/cashfree-js'

export type CashfreeClientMode = 'sandbox' | 'production'

export function cashfreeClientMode(): CashfreeClientMode {
  return import.meta.env.VITE_CASHFREE_MODE === 'production' ? 'production' : 'sandbox'
}

export function isCashfreeClientEnabled(): boolean {
  return import.meta.env.VITE_CASHFREE_ENABLED === 'true'
}

export async function openCashfreeCheckout(paymentSessionId: string): Promise<void> {
  const cashfree = await load({ mode: cashfreeClientMode() })
  await cashfree.checkout({
    paymentSessionId,
    redirectTarget: '_self',
  })
}

import { load } from '@cashfreepayments/cashfree-js'

export type CashfreeClientMode = 'sandbox' | 'production'

function parseClientMode(raw: string | undefined): CashfreeClientMode | null {
  const mode = raw?.trim().toLowerCase()
  if (mode === 'production' || mode === 'prod' || mode === 'live') return 'production'
  if (mode === 'sandbox' || mode === 'test') return 'sandbox'
  return null
}

export function cashfreeClientMode(): CashfreeClientMode {
  const fromEnv = parseClientMode(process.env.NEXT_PUBLIC_CASHFREE_MODE)
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && /(?:^|\.)prizma-guru\.vercel\.app$/i.test(window.location.hostname)) {
    return 'production'
  }
  return 'sandbox'
}

export function isCashfreeClientEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CASHFREE_ENABLED === 'true'
}

export async function openCashfreeCheckout(
  paymentSessionId: string,
  mode?: CashfreeClientMode,
): Promise<void> {
  const sessionId = paymentSessionId.trim()
  if (!sessionId.startsWith('session_')) {
    throw new Error('Could not start payment. Try again.')
  }
  const checkoutMode = parseClientMode(mode) ?? cashfreeClientMode()
  const cashfree = await load({ mode: checkoutMode })
  await cashfree.checkout({
    paymentSessionId: sessionId,
    redirectTarget: '_modal',
  })
}

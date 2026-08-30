import { useEffect } from 'react'
import { load } from '@cashfreepayments/cashfree-js'

export type CashfreeClientMode = 'sandbox' | 'production'

/** Origin Cashfree has already approved for the JS checkout. */
export const CASHFREE_JS_ORIGIN = 'https://prizma-guru.vercel.app'

function parseClientMode(raw: string | undefined): CashfreeClientMode | null {
  const mode = raw?.trim().toLowerCase()
  if (mode === 'production' || mode === 'prod' || mode === 'live') return 'production'
  if (mode === 'sandbox' || mode === 'test') return 'sandbox'
  return null
}

function pageHost(): string {
  if (typeof window === 'undefined') return ''
  return window.location.hostname.split(':')[0]?.toLowerCase() ?? ''
}

function isApprovedCashfreeHost(host: string): boolean {
  return host === 'prizma-guru.vercel.app'
}

function needsCashfreeHostHop(host: string): boolean {
  return host === 'prizma.guru' || host === 'www.prizma.guru'
}

export function cashfreeClientMode(): CashfreeClientMode {
  const fromEnv = parseClientMode(process.env.NEXT_PUBLIC_CASHFREE_MODE)
  if (fromEnv) return fromEnv
  const host = pageHost()
  if (isApprovedCashfreeHost(host) || host === 'prizma.guru' || host === 'www.prizma.guru') {
    return 'production'
  }
  return 'sandbox'
}

export function isCashfreeClientEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CASHFREE_ENABLED === 'true'
}

export function takeCashfreeSessionFromUrl(): {
  paymentSessionId: string
  mode?: CashfreeClientMode
} | null {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const session = url.searchParams.get('cf_session')?.trim() ?? ''
  if (!session.startsWith('session_')) return null
  const mode = parseClientMode(url.searchParams.get('cf_mode') ?? undefined) ?? undefined
  url.searchParams.delete('cf_session')
  url.searchParams.delete('cf_mode')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  return { paymentSessionId: session, mode }
}

export function useResumeCashfreeCheckout(): void {
  useEffect(() => {
    const pending = takeCashfreeSessionFromUrl()
    if (!pending) return
    void openCashfreeCheckout(pending.paymentSessionId, pending.mode)
  }, [])
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
  const host = pageHost()

  if (needsCashfreeHostHop(host)) {
    const next = new URL('/pay/cashfree', CASHFREE_JS_ORIGIN)
    next.searchParams.set('cf_host', '1')
    next.searchParams.set('cf_session', sessionId)
    next.searchParams.set('cf_mode', checkoutMode)
    next.searchParams.set('from', `${window.location.pathname}${window.location.search}`)
    window.location.assign(next.toString())
    return
  }

  const cashfree = await load({ mode: checkoutMode })
  await cashfree.checkout({
    paymentSessionId: sessionId,
    redirectTarget: '_modal',
  })
}

'use client'

import { useEffect, useState } from 'react'
import { openCashfreeCheckout, takeCashfreeSessionFromUrl } from '../lib/cashfreeCheckout'
import { SITE_URL } from '../lib/seo'

function safeFromPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/student'
  return raw
}

export function CashfreeHostPage() {
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState('/student')

  useEffect(() => {
    const url = new URL(window.location.href)
    const back = safeFromPath(url.searchParams.get('from'))
    setFrom(back)
    const pending = takeCashfreeSessionFromUrl()
    if (!pending) {
      setError('This payment link has expired. Go back and start checkout again.')
      return
    }
    void (async () => {
      try {
        await openCashfreeCheckout(pending.paymentSessionId, pending.mode)
        window.location.assign(`${SITE_URL}${back}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment could not start')
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-xs font-semibold tracking-wide text-orange-300 uppercase">PRIZMA</p>
        <h1 className="mt-2 text-xl font-semibold">
          {error ? 'Payment could not open' : 'Opening secure payment…'}
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {error ?? 'Stay on this page. The Cashfree checkout will appear in a moment.'}
        </p>
        <a
          href={`${SITE_URL}${from}`}
          className="mt-5 inline-flex rounded-full bg-educture-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-educture-orange-dark"
        >
          Back to PRIZMA
        </a>
      </div>
    </div>
  )
}

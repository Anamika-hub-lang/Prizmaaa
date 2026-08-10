import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { confirmCashfreeOrder } from '../../lib/cashfreeApi'
import { readCashfreeOrderId, takeCashfreeOrderId, clearCashfreeOrderId } from '../../lib/cashfreeOrderId'
import { notifyEnrollmentsRefresh } from '../../lib/enrollmentRefresh'

/** If Cashfree return URL was skipped, confirm pending order when student portal loads. */
export function CashfreePendingConfirm() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const orderId = readCashfreeOrderId()
    if (!orderId) return

    void (async () => {
      try {
        const result = await confirmCashfreeOrder(getToken, orderId)
        takeCashfreeOrderId()
        notifyEnrollmentsRefresh()
        const base = result.redirect.split('?')[0]
        const enrolled = `${base}?enrolled=1`
        if (window.location.pathname !== base) {
          window.location.assign(enrolled)
        } else if (!window.location.search.includes('enrolled=1')) {
          window.location.assign(enrolled)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (
          msg.includes('Payment not completed') ||
          msg.includes('not completed yet') ||
          msg.includes('Could not read order')
        ) {
          clearCashfreeOrderId()
        }
        console.warn('[Cashfree] Pending confirm failed:', msg)
      }
    })()
  }, [isLoaded, isSignedIn, getToken])

  return null
}

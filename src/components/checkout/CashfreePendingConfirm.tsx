import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { confirmCashfreeOrder } from '../../lib/cashfreeApi'
import { readCashfreeOrderId, takeCashfreeOrderId } from '../../lib/cashfreeOrderId'
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
        console.warn(
          '[Cashfree] Pending confirm failed:',
          err instanceof Error ? err.message : err,
        )
      }
    })()
  }, [isLoaded, isSignedIn, getToken])

  return null
}

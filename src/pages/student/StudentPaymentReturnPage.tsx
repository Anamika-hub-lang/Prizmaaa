import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { confirmCashfreeOrder } from '../../lib/cashfreeApi'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { AppButton } from '../../components/ui/AppButton'

function orderIdFromParams(searchParams: URLSearchParams): string | null {
  const keys = ['order_id', 'orderId', 'cf_order_id', 'cf_orderId']
  for (const key of keys) {
    const v = searchParams.get(key)?.trim()
    if (v) return v
  }
  return null
}

export function StudentPaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const orderId = orderIdFromParams(searchParams)
  const [message, setMessage] = useState('Confirming your payment with Cashfree…')
  const [failed, setFailed] = useState(false)

  const runConfirm = useCallback(async () => {
    if (!orderId) {
      setMessage('Missing order id from Cashfree.')
      setFailed(true)
      return
    }
    if (!isSignedIn) {
      setMessage('Please sign in to finish enrolling your class.')
      setFailed(true)
      return
    }
    setFailed(false)
    setMessage('Confirming your payment with Cashfree…')
    try {
      const result = await confirmCashfreeOrder(getToken, orderId)
      navigate(`${result.redirect}?enrolled=1`, { replace: true })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Payment confirmation failed')
      setFailed(true)
    }
  }, [orderId, getToken, navigate, isSignedIn])

  useEffect(() => {
    if (!isLoaded) return
    void runConfirm()
  }, [isLoaded, runConfirm])

  return (
    <>
      <StudentPageHeader title="Payment status" subtitle={message} />
      <main className="max-w-lg mx-auto px-4 py-12 text-center text-sm text-gray-600 space-y-4">
        <p>{message}</p>
        {failed && orderId && isSignedIn && (
          <AppButton type="button" onClick={() => void runConfirm()}>
            Try confirming again
          </AppButton>
        )}
        {failed && !isSignedIn && (
          <Link
            to="/sign-in"
            state={{ from: `/student/payment/return?order_id=${encodeURIComponent(orderId ?? '')}` }}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-educture-orange text-white font-semibold text-sm"
          >
            Sign in to complete enrollment
          </Link>
        )}
        <p>
          <Link to="/student" className="text-sky-600 hover:underline">Go to dashboard</Link>
        </p>
      </main>
    </>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { confirmCashfreeOrder } from '../../lib/cashfreeApi'
import { StudentPageHeader } from '../../components/layout/StudentLayout'

export function StudentPaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getToken, isLoaded } = useAuth()
  const orderId = searchParams.get('order_id')
  const [message, setMessage] = useState('Confirming your payment with Cashfree…')

  useEffect(() => {
    if (!isLoaded) return
    if (!orderId) {
      setMessage('Missing order id from Cashfree.')
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const result = await confirmCashfreeOrder(getToken, orderId)
        if (!cancelled) navigate(result.redirect, { replace: true })
      } catch (err) {
        if (!cancelled) {
          setMessage(err instanceof Error ? err.message : 'Payment confirmation failed')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, orderId, getToken, navigate])

  return (
    <>
      <StudentPageHeader title="Payment status" subtitle={message} />
      <main className="max-w-lg mx-auto px-4 py-12 text-center text-sm text-gray-600">
        {message}
      </main>
    </>
  )
}

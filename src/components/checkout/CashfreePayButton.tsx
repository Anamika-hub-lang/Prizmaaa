import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { createCashfreeOrder } from '../../lib/cashfreeApi'
import { openCashfreeCheckout } from '../../lib/cashfreeCheckout'

type Props = {
  classId: string
  purpose: 'paid' | 'trial'
  planTier?: 'monthly' | 'three-month'
  label: string
  className?: string
}

export function CashfreePayButton({ classId, purpose, planTier, label, className }: Props) {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setError(null)
    setLoading(true)
    try {
      const { paymentSessionId, mode } = await createCashfreeOrder(getToken, {
        classId,
        purpose,
        planTier,
      })
      await openCashfreeCheckout(paymentSessionId, mode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not start')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={loading}
        className={
          className ??
          'w-full py-3 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark disabled:opacity-60 transition-colors'
        }
      >
        {loading ? 'Opening Cashfree…' : label}
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

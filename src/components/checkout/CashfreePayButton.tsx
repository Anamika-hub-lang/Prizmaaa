import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/nextjs'
import { createCashfreeOrder } from '../../lib/cashfreeApi'
import { openCashfreeCheckout } from '../../lib/cashfreeCheckout'
import { stashCashfreeOrderId } from '../../lib/cashfreeOrderId'
import { fetchUserProfile } from '../../lib/saveProfileDetails'
import { sanitizeIndianPhoneInput, toIndianMobileDigits, validateIndianPhone } from '../../lib/phoneValidation'

type Props = {
  classId: string
  purpose: 'paid' | 'trial'
  planTier?: 'monthly' | 'three-month' | 'six-month'
  label: string
  className?: string
}

export function CashfreePayButton({ classId, purpose, planTier, label, className }: Props) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedPhone, setSavedPhone] = useState<string | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneReady, setPhoneReady] = useState(false)

  useEffect(() => {
    const reset = () => setLoading(false)
    window.addEventListener('pageshow', reset)
    window.addEventListener('focus', reset)
    return () => {
      window.removeEventListener('pageshow', reset)
      window.removeEventListener('focus', reset)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const clerkPhone = toIndianMobileDigits(
        user?.primaryPhoneNumber?.phoneNumber ?? user?.phoneNumbers[0]?.phoneNumber,
      )
      try {
        const profile = await fetchUserProfile(getToken)
        const profilePhone = toIndianMobileDigits(profile?.phone)
        if (!cancelled) setSavedPhone(profilePhone ?? clerkPhone)
      } catch {
        if (!cancelled) setSavedPhone(clerkPhone)
      } finally {
        if (!cancelled) setPhoneReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getToken, user])

  async function handleClick() {
    setError(null)
    const resolvedPhone = savedPhone ?? toIndianMobileDigits(phoneInput)
    if (!resolvedPhone) {
      const check = validateIndianPhone(phoneInput)
      setError(check.ok === false ? check.error : 'Enter your 10-digit WhatsApp number to continue.')
      return
    }

    setLoading(true)
    try {
      const { paymentSessionId, orderId, mode } = await createCashfreeOrder(getToken, {
        classId,
        purpose,
        planTier,
        phone: resolvedPhone,
      })
      stashCashfreeOrderId(orderId)
      await openCashfreeCheckout(paymentSessionId, mode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not start')
      setLoading(false)
    }
  }

  const needsPhone = phoneReady && !savedPhone
  const missingPhoneError = Boolean(error && /phone|WhatsApp/i.test(error))

  return (
    <div>
      {needsPhone && (
        <label className="block mb-3 text-left">
          <span className="text-xs font-semibold text-gray-600">Phone (WhatsApp)</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={phoneInput}
            onChange={(e) => setPhoneInput(sanitizeIndianPhoneInput(e.target.value))}
            placeholder="10-digit mobile"
            className="mt-1 w-full rounded-xl border-[3px] border-orange-100 px-3 py-2.5 text-sm outline-none focus:border-educture-orange"
          />
        </label>
      )}
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={loading || !phoneReady}
        className={
          className ??
          'w-full py-3 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark disabled:opacity-60 transition-colors'
        }
      >
        {loading ? 'Please wait…' : label}
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}
      {missingPhoneError && (
        <p className="text-sm text-gray-600 mt-2">
          <Link to="/student/profile" className="font-semibold text-educture-orange hover:underline">
            Add phone on Profile
          </Link>
        </p>
      )}
    </div>
  )
}

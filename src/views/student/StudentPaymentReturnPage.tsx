'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import { confirmCashfreeOrder } from '../../lib/cashfreeApi'
import {
  isPlausibleCashfreeOrderId,
  orderIdFromSearchParams,
  resolveCashfreeOrderId,
  stashCashfreeOrderId,
  takeCashfreeOrderId,
} from '../../lib/cashfreeOrderId'
import { notifyEnrollmentsRefresh } from '../../lib/enrollmentRefresh'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { AppButton } from '../../components/ui/AppButton'

export function StudentPaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const rawUrlOrderId = useMemo(() => orderIdFromSearchParams(searchParams), [searchParams])
  const orderId = useMemo(() => resolveCashfreeOrderId(searchParams), [searchParams])
  const [message, setMessage] = useState('Confirming your payment with Cashfree…')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!isLoaded || isSignedIn) return
    const returnTo = `${window.location.pathname}${window.location.search}`
    const fromUrl = orderIdFromSearchParams(searchParams)
    if (fromUrl && isPlausibleCashfreeOrderId(fromUrl)) {
      stashCashfreeOrderId(fromUrl)
    }
    try {
      sessionStorage.setItem('educture_auth_return', returnTo)
    } catch {
      /* ignore */
    }
    navigate('/sign-in', { replace: true, state: { from: returnTo } })
  }, [isLoaded, isSignedIn, searchParams, navigate])

  const runConfirm = useCallback(async () => {
    if (!isSignedIn) return
    setFailed(false)
    setMessage('Confirming your payment with Cashfree…')
    try {
      const id = resolveCashfreeOrderId(searchParams)
      if (!id) {
        if (rawUrlOrderId && !isPlausibleCashfreeOrderId(rawUrlOrderId)) {
          setMessage(
            'This link has an invalid order id (for example edu_XXXXX is only a placeholder). Open Online Classes, pick your class, and pay again from checkout.',
          )
        } else {
          setMessage(
            'We could not find your Cashfree order id. Open Online Classes and start checkout again from your class page.',
          )
        }
        setFailed(true)
        return
      }
      const result = await confirmCashfreeOrder(getToken, id)
      takeCashfreeOrderId()
      notifyEnrollmentsRefresh()
      navigate(`${result.redirect}?enrolled=1`, { replace: true })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Payment confirmation failed')
      setFailed(true)
    }
  }, [searchParams, getToken, navigate, isSignedIn, rawUrlOrderId])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    void runConfirm()
  }, [isLoaded, isSignedIn, runConfirm])

  const canRetry = failed && orderId && isSignedIn

  return (
    <>
      <StudentPageHeader title="Payment status" subtitle={message} />
      <main className="max-w-lg mx-auto px-4 py-12 text-center text-sm text-gray-600 space-y-4">
        <p>{message}</p>
        {canRetry && (
          <AppButton type="button" onClick={() => void runConfirm()}>
            Try confirming again
          </AppButton>
        )}
        {failed && !isSignedIn && (
          <Link
            to="/sign-in"
            state={{ from: `${window.location.pathname}${window.location.search}` }}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-educture-orange text-white font-semibold text-sm"
          >
            Sign in to complete enrollment
          </Link>
        )}
        <p>
          <Link to="/student/browse" className="text-sky-600 hover:underline">Browse classes</Link>
          {' · '}
          <Link to="/student" className="text-sky-600 hover:underline">Dashboard</Link>
        </p>
      </main>
    </>
  )
}

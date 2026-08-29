'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { confirmCounsellingOrder } from '../lib/counsellingPayment'
import {
  isPlausibleCashfreeOrderId,
  orderIdFromSearchParams,
  resolveCashfreeOrderId,
  stashCashfreeOrderId,
  takeCashfreeOrderId,
} from '../lib/cashfreeOrderId'
import { formatScheduleLabel } from '../data/counsellingSchedule'

export function CounsellingPaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const rawUrlOrderId = useMemo(() => orderIdFromSearchParams(searchParams), [searchParams])
  const orderId = useMemo(() => resolveCashfreeOrderId(searchParams), [searchParams])
  const [message, setMessage] = useState('Confirming your counselling payment…')
  const [failed, setFailed] = useState(false)
  const [scheduleLabel, setScheduleLabel] = useState<string | null>(null)

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
    setMessage('Confirming your counselling payment…')
    try {
      const id = resolveCashfreeOrderId(searchParams)
      if (!id) {
        setMessage('Could not find your payment order. Start booking again from the counselling page.')
        setFailed(true)
        return
      }
      const result = await confirmCounsellingOrder(getToken, id)
      takeCashfreeOrderId()
      if (result.scheduledDate && result.scheduledTime) {
        setScheduleLabel(formatScheduleLabel(result.scheduledDate, result.scheduledTime))
      }
      setMessage('Payment confirmed! Your counselling session is booked.')
      navigate(result.redirect, { replace: true })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Payment confirmation failed')
      setFailed(true)
    }
  }, [searchParams, getToken, navigate, isSignedIn])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    void runConfirm()
  }, [isLoaded, isSignedIn, runConfirm])

  const canRetry = failed && orderId && isSignedIn

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f3]">
      <MainNavbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-16 text-center">
        <h1 className="font-display text-2xl text-[#1a1a1a]">Payment status</h1>
        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{message}</p>
        {scheduleLabel && !failed && (
          <p className="text-sm font-semibold text-educture-orange mt-3">Scheduled: {scheduleLabel}</p>
        )}
        {canRetry && (
          <button
            type="button"
            onClick={() => void runConfirm()}
            className="mt-6 px-6 py-3 rounded-full bg-educture-orange text-white font-semibold text-sm"
          >
            Try confirming again
          </button>
        )}
        {failed && (
          <p className="mt-8">
            <Link to="/counselling" className="text-educture-orange font-semibold hover:underline">
              Back to counselling
            </Link>
          </p>
        )}
        {rawUrlOrderId && !isPlausibleCashfreeOrderId(rawUrlOrderId) && (
          <p className="text-xs text-gray-400 mt-4">Invalid order id in URL: {rawUrlOrderId}</p>
        )}
      </main>
      <MarketingFooter />
    </div>
  )
}

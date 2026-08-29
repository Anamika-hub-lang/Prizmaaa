'use client'

import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/nextjs'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  Lock,
  Phone,
  Video,
} from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import {
  COUNSELLING_DURATION_LABEL,
  COUNSELLING_PRICE_INR,
  counsellingGroupById,
  counsellingTopicById,
  counsellingTopicsByGroup,
  type CounsellingGroupId,
} from '../data/counsellingServices'
import {
  availableSlotsForDate,
  formatScheduleLabel,
  minBookingDateString,
  type CounsellingTimeSlot,
} from '../data/counsellingSchedule'
import { createCounsellingOrder } from '../lib/counsellingPayment'
import { openCashfreeCheckout, isCashfreeClientEnabled } from '../lib/cashfreeCheckout'
import { stashCashfreeOrderId } from '../lib/cashfreeOrderId'
import { sanitizeIndianPhoneInput, validateIndianPhone } from '../lib/phoneValidation'

const GROUP_IDS: CounsellingGroupId[] = ['career', 'domain', 'future']

function isGroupId(value: string): value is CounsellingGroupId {
  return GROUP_IDS.includes(value as CounsellingGroupId)
}

export function CounsellingCategoryPage() {
  const { groupId = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselected = searchParams.get('topic') ?? ''
  const booked = searchParams.get('booked') === '1'

  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()

  const group = isGroupId(groupId) ? counsellingGroupById(groupId) : undefined
  const topics = group ? counsellingTopicsByGroup(group.id) : []

  const [topicId, setTopicId] = useState(preselected)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredMode, setPreferredMode] = useState<'meet' | 'call'>('meet')
  const [scheduledDate, setScheduledDate] = useState(minBookingDateString())
  const [scheduledTime, setScheduledTime] = useState<CounsellingTimeSlot | ''>('')
  const [note, setNote] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cashfreeOn = isCashfreeClientEnabled()
  const timeSlots = useMemo(() => availableSlotsForDate(scheduledDate), [scheduledDate])

  useEffect(() => {
    if (preselected) setTopicId(preselected)
  }, [preselected])

  useEffect(() => {
    if (!user) return
    if (!fullName && user.fullName) setFullName(user.fullName)
    const primaryEmail = user.primaryEmailAddress?.emailAddress
    if (!email && primaryEmail) setEmail(primaryEmail)
  }, [user, fullName, email])

  useEffect(() => {
    if (scheduledTime && !timeSlots.some((s) => s.value === scheduledTime)) {
      setScheduledTime('')
    }
  }, [scheduledDate, scheduledTime, timeSlots])

  if (!group) {
    return <Navigate to="/counselling" replace />
  }

  const selected = counsellingTopicById(topicId)
  const groupIdSafe = group.id

  function buildBookingPayload() {
    const phoneCheck = validateIndianPhone(phone)
    if (!phoneCheck.ok) throw new Error(phoneCheck.error)
    if (!topicId) throw new Error('Please choose a call type.')
    if (!scheduledDate || !scheduledTime) throw new Error('Please pick a date and time slot for your guidance call.')
    return {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phoneCheck.digits,
      categoryId: topicId,
      groupId: groupIdSafe,
      preferredMode,
      scheduledDate,
      scheduledTime,
      note: note.trim() || undefined,
    }
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isSignedIn) {
      const returnTo = `${window.location.pathname}${window.location.search}#book`
      try {
        sessionStorage.setItem('educture_auth_return', returnTo)
      } catch {
        /* ignore */
      }
      navigate('/sign-in', { state: { from: returnTo } })
      return
    }

    try {
      buildBookingPayload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please complete the form')
      return
    }

    if (!cashfreeOn) {
      setError('Online payment is not available right now. Please try again later.')
      return
    }

    setPaying(true)
    try {
      const payload = buildBookingPayload()
      const { paymentSessionId, orderId, mode } = await createCounsellingOrder(getToken, payload)
      stashCashfreeOrderId(orderId)
      await openCashfreeCheckout(paymentSessionId, mode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not start')
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0f0f12] text-white">
          <img
            src={group.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f12] via-[#0f0f12]/90 to-[#0f0f12]/70" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
            <Link
              to="/counselling"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              All topics
            </Link>
            <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em] mt-6">
              {group.title} guidance
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-2 leading-tight max-w-2xl">
              {group.subtitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mt-4 max-w-xl leading-relaxed">{group.description}</p>
            <div className="inline-flex items-center gap-2 mt-6 rounded-2xl border border-educture-orange/40 bg-educture-orange/10 px-4 py-2.5">
              <IndianRupee className="w-4 h-4 text-educture-orange" />
              <span className="font-bold">₹{COUNSELLING_PRICE_INR}</span>
              <span className="text-sm text-gray-400">/ {COUNSELLING_DURATION_LABEL}</span>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-sky-50/50 border-b border-orange-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1a1a1a] mb-2">Pick your call type</h2>
            <p className="text-sm text-gray-500 mb-8">
              {topics.length} types under <strong className="text-gray-700">{group.title}</strong> — select one to
              book below.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => {
                const active = topicId === topic.id
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      setTopicId(topic.id)
                      document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className={`rounded-2xl border-2 p-5 text-left transition-all ${
                      active
                        ? 'border-educture-orange bg-white shadow-md ring-2 ring-educture-orange/20'
                        : 'border-orange-100 bg-white hover:border-educture-orange/40'
                    }`}
                  >
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${topic.accent} text-white`}
                    >
                      <topic.icon className="h-5 w-5" />
                    </span>
                    <p className="font-bold text-[#1a1a1a] mt-3">{topic.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{topic.tagline}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-white" id="book">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1a1a1a] text-center">Book a guidance call</h2>
            <p className="text-sm text-gray-500 text-center mt-2 mb-2">
              Pay ₹{COUNSELLING_PRICE_INR} to confirm · one session on Meet or call
            </p>
            <p className="text-xs text-center text-gray-400 mb-8 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Secured by Cashfree · Booking confirmed only after payment
            </p>

            {booked ? (
              <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="font-bold text-lg text-[#1a1a1a] mt-4">Booking confirmed!</p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Payment received for <strong>{selected?.title ?? 'your guidance call'}</strong>. We&apos;ll
                  send Meet/call details to your email before the scheduled slot.
                </p>
                <Link
                  to="/counselling"
                  className="inline-block mt-6 text-sm font-semibold text-educture-orange hover:underline"
                >
                  Back to topics
                </Link>
              </div>
            ) : (
              <form
                onSubmit={(e) => void handlePay(e)}
                className="rounded-3xl border-[3px] border-orange-100 bg-[#fff9f3] p-6 sm:p-8 space-y-4 text-left shadow-sm"
              >
                {!isLoaded ? null : !isSignedIn ? (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <Link to="/sign-in" className="font-semibold text-educture-orange hover:underline">
                      Sign in
                    </Link>{' '}
                    to pay and confirm your booking.
                  </p>
                ) : null}

                <div>
                  <label className="text-xs font-semibold text-gray-600">Call type</label>
                  <select
                    required
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange"
                  >
                    <option value="" disabled>
                      Select topic
                    </option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Preferred date
                    </label>
                    <input
                      required
                      type="date"
                      min={minBookingDateString()}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Time slot (IST)
                    </label>
                    <select
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value as CounsellingTimeSlot)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange"
                    >
                      <option value="" disabled>
                        {timeSlots.length === 0 ? 'No slots today — pick another date' : 'Select time'}
                      </option>
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {scheduledDate && scheduledTime && (
                  <p className="text-xs text-educture-orange font-medium -mt-1">
                    Scheduled: {formatScheduleLabel(scheduledDate, scheduledTime)}
                  </p>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-600">Full name</label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Email</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Phone (WhatsApp)</label>
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={phone}
                      onChange={(e) => setPhone(sanitizeIndianPhoneInput(e.target.value))}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{phone.length}/10 digits</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Preferred format</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setPreferredMode('meet')}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
                        preferredMode === 'meet'
                          ? 'border-educture-orange bg-educture-orange/10 text-educture-orange'
                          : 'border-orange-100 bg-white text-gray-600'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      Google Meet
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredMode('call')}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
                        preferredMode === 'call'
                          ? 'border-educture-orange bg-educture-orange/10 text-educture-orange'
                          : 'border-orange-100 bg-white text-gray-600'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      Phone call
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Note (optional)</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Your goal or current situation…"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none resize-none focus:border-educture-orange"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={paying || timeSlots.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark disabled:opacity-60 transition-colors shadow-[0_8px_24px_rgba(243,112,33,0.35)]"
                >
                  {paying ? 'Please wait…' : `Pay ₹${COUNSELLING_PRICE_INR} & confirm booking`}
                </button>

                {!cashfreeOn && (
                  <p className="text-xs text-amber-700 text-center">
                    Online payments are not enabled in this environment.
                  </p>
                )}
              </form>
            )}

            <p className="text-center mt-6">
              <Link
                to="/counselling"
                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-educture-orange"
              >
                <ArrowLeft className="w-4 h-4" />
                Other topics
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

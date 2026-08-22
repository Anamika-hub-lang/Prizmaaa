import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/nextjs'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  Lock,
  Video,
} from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import {
  INTERVIEW_PREP_DURATION_LABEL,
  INTERVIEW_PREP_PRICE_INR,
  INTERVIEW_PREP_TOPIC_ID,
  careerOfferings,
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

const offering = careerOfferings.find((item) => item.id === INTERVIEW_PREP_TOPIC_ID)

export function InterviewPrepPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const booked = searchParams.get('booked') === '1'

  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [scheduledDate, setScheduledDate] = useState(minBookingDateString())
  const [scheduledTime, setScheduledTime] = useState<CounsellingTimeSlot | ''>('')
  const [note, setNote] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cashfreeOn = isCashfreeClientEnabled()
  const timeSlots = useMemo(() => availableSlotsForDate(scheduledDate), [scheduledDate])

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

  function buildBookingPayload() {
    const phoneCheck = validateIndianPhone(phone)
    if (!phoneCheck.ok) throw new Error(phoneCheck.error)
    if (!scheduledDate || !scheduledTime) {
      throw new Error('Please pick a date and time slot for your mock interview.')
    }
    return {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phoneCheck.digits,
      categoryId: INTERVIEW_PREP_TOPIC_ID,
      groupId: 'career',
      preferredMode: 'meet' as const,
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

  if (!offering) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0f0f12] text-white">
          <img src={offering.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f12] via-[#0f0f12]/90 to-[#0f0f12]/70" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
            <Link
              to="/counselling"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              All guidance topics
            </Link>
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] mt-6">
              Live mock interview
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-2 leading-tight max-w-2xl">
              {offering.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mt-4 max-w-xl leading-relaxed">{offering.description}</p>
            <div className="inline-flex items-center gap-2 mt-6 rounded-2xl border border-educture-orange/40 bg-educture-orange/10 px-4 py-2.5">
              <IndianRupee className="w-4 h-4 text-educture-orange" />
              <span className="font-bold">₹{INTERVIEW_PREP_PRICE_INR}</span>
              <span className="text-sm text-gray-400">/ {INTERVIEW_PREP_DURATION_LABEL}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              Conducted live on Google Meet — experience real interview flow
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-sky-50/50 border-b border-orange-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1a1a1a] mb-2">What happens in the session</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-2xl">
              A mentor runs a structured mock interview — the same kind of rounds companies use — so you know how
              questions flow, how to respond, and what to improve before your actual interview.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {offering.highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border-2 border-orange-100 bg-white p-5 text-left shadow-sm"
                >
                  <p className="font-bold text-[#1a1a1a]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-white" id="book">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1a1a1a] text-center">Book your mock interview</h2>
            <p className="text-sm text-gray-500 text-center mt-2 mb-2">
              Pay ₹{INTERVIEW_PREP_PRICE_INR} to confirm · live on Google Meet
            </p>
            <p className="text-xs text-center text-gray-400 mb-8 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Secured by Cashfree · Booking confirmed only after payment
            </p>

            {booked ? (
              <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="font-bold text-lg text-[#1a1a1a] mt-4">Mock interview booked!</p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Payment received. We&apos;ll send your Google Meet link to your email before the scheduled slot.
                </p>
                <Link
                  to="/counselling"
                  className="inline-block mt-6 text-sm font-semibold text-educture-orange hover:underline"
                >
                  Back to guidance topics
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
                    to pay and confirm your mock interview.
                  </p>
                ) : null}

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
                  <label className="text-xs font-semibold text-gray-600">Note (optional)</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Target role, company type, or tech stack…"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none resize-none focus:border-educture-orange"
                  />
                </div>

                <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs text-sky-800">
                  <Video className="w-3.5 h-3.5 inline mr-1.5 align-text-bottom" />
                  This session runs on Google Meet only — you&apos;ll get the link after booking.
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
                  {paying ? 'Please wait…' : `Pay ₹${INTERVIEW_PREP_PRICE_INR} & confirm booking`}
                </button>

                {!cashfreeOn && (
                  <p className="text-xs text-amber-700 text-center">
                    Online payments are not enabled in this environment.
                  </p>
                )}
              </form>
            )}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Calendar, CheckCircle2, IndianRupee, Phone, Video } from 'lucide-react'
import {
  counsellingGroupById,
  counsellingOfferingTitle,
  counsellingPriceInr,
  COUNSELLING_PRICE_INR,
} from '../../data/counsellingServices'
import { formatScheduleLabel } from '../../data/counsellingSchedule'
import type { CounsellingBooking } from '../../lib/counsellingPayment'
import { dashboardCardBorder, dashboardTint } from '../ui/dashboardCardStyles'
import { AppButton } from '../ui/AppButton'

type Props = {
  bookings: CounsellingBooking[]
  loading: boolean
  error: string | null
  showSuccess?: boolean
}

function modeLabel(mode: CounsellingBooking['preferredMode']) {
  return mode === 'meet' ? 'Google Meet' : 'Phone call'
}

export function CounsellingBookingsPanel({ bookings, loading, error, showSuccess }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="text-left">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Your counselling sessions
          </h2>
          <p className="text-xs text-gray-500 mt-1">Paid bookings — date, time, and session type</p>
        </div>
        <AppButton to="/counselling" size="sm" variant="outline">
          Book another
        </AppButton>
      </div>

      {showSuccess && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-left flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Payment confirmed — session booked!</p>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              Your counselling details are below. We&apos;ll reach out before your scheduled slot.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className={`${dashboardCardBorder} rounded-2xl bg-white p-6 text-sm text-gray-500`}>
          Loading your counselling sessions…
        </div>
      )}

      {!loading && error && (
        <div className={`${dashboardCardBorder} rounded-2xl bg-white p-6 text-sm text-red-600`}>
          {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className={`${dashboardCardBorder} border-dashed rounded-2xl bg-white p-8 text-center`}>
          <p className="text-sm text-gray-500">No counselling sessions booked yet.</p>
          <AppButton to="/counselling" className="mt-4">
            Book counselling — ₹{COUNSELLING_PRICE_INR}
          </AppButton>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking, index) => {
            const topicTitle = counsellingOfferingTitle(booking.categoryId)
            const group = booking.groupId ? counsellingGroupById(booking.groupId) : undefined
            const schedule =
              booking.scheduledDate && booking.scheduledTime
                ? formatScheduleLabel(booking.scheduledDate, booking.scheduledTime)
                : 'Schedule pending'

            return (
              <article
                key={booking.id}
                className={`${dashboardCardBorder} ${dashboardTint(index % 5).bg} ${dashboardTint(index % 5).border} rounded-2xl p-5 text-left`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-educture-orange">
                      {group?.title ?? 'Counselling'}
                    </p>
                    <h3 className="font-bold text-lg text-[#1d1d1d] mt-1 leading-snug">
                      {topicTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      For <strong className="text-gray-800">{booking.fullName}</strong>
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-[10px] font-bold uppercase text-emerald-800">
                    {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-educture-orange shrink-0" />
                    <span>{schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    {booking.preferredMode === 'meet' ? (
                      <Video className="w-4 h-4 text-educture-orange shrink-0" />
                    ) : (
                      <Phone className="w-4 h-4 text-educture-orange shrink-0" />
                    )}
                    <span>{modeLabel(booking.preferredMode)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                  <span>{booking.email}</span>
                  <span>+91 {booking.phone}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                    <IndianRupee className="w-3 h-3" />
                    {counsellingPriceInr(booking.categoryId)} paid
                  </span>
                </div>

                {booking.note && (
                  <p className="mt-3 text-xs text-gray-600 bg-white/70 rounded-xl border border-orange-100/80 px-3 py-2">
                    <span className="font-semibold text-gray-700">Note: </span>
                    {booking.note}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <p className="text-xs text-gray-500 text-left">
          Need to change your slot?{' '}
          <Link to="/counselling" className="font-semibold text-educture-orange hover:underline">
            Contact us via counselling page
          </Link>
        </p>
      )}
    </section>
  )
}

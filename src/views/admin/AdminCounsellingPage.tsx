import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import { Calendar, IndianRupee, Phone, RefreshCw, Search, Video } from 'lucide-react'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { dashboardCardBorder } from '../../components/ui/dashboardCardStyles'
import {
  counsellingGroupById,
  counsellingTopicById,
  COUNSELLING_PRICE_INR,
} from '../../data/counsellingServices'
import { formatScheduleLabel } from '../../data/counsellingSchedule'
import {
  fetchAdminCounsellingBookings,
  type AdminCounsellingBooking,
} from '../../lib/adminCounselling'

type StatusFilter = 'all' | 'paid' | 'pending' | 'failed'

function parseStatus(value: string | null): StatusFilter {
  if (value === 'paid' || value === 'pending' || value === 'failed') return value
  return 'all'
}

function paymentBadge(status: AdminCounsellingBooking['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 border-emerald-200 text-emerald-800'
    case 'pending':
      return 'bg-amber-100 border-amber-200 text-amber-900'
    case 'failed':
      return 'bg-rose-100 border-rose-200 text-rose-800'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

function paymentLabel(status: AdminCounsellingBooking['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'Paid'
    case 'pending':
      return 'Not paid'
    case 'failed':
      return 'Failed'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

export function AdminCounsellingPage() {
  const { getToken } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = parseStatus(searchParams.get('status'))
  const [query, setQuery] = useState('')
  const [bookings, setBookings] = useState<AdminCounsellingBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAdminCounsellingBookings(getToken)
      setBookings(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  const counts = useMemo(() => {
    let paid = 0
    let pending = 0
    let failed = 0
    for (const b of bookings) {
      if (b.paymentStatus === 'paid') paid += 1
      else if (b.paymentStatus === 'pending') pending += 1
      else if (b.paymentStatus === 'failed') failed += 1
    }
    return { all: bookings.length, paid, pending, failed }
  }, [bookings])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.paymentStatus !== statusFilter) return false
      if (!q) return true
      const hay = [b.fullName, b.email, b.phone, b.categoryId, b.groupId ?? '', b.cashfreeOrderId ?? '']
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [bookings, query, statusFilter])

  function setStatus(next: StatusFilter) {
    const params = new URLSearchParams(searchParams)
    if (next === 'all') params.delete('status')
    else params.set('status', next)
    setSearchParams(params, { replace: true })
  }

  const filters: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'paid', label: 'Paid', count: counts.paid },
    { id: 'pending', label: 'Not paid', count: counts.pending },
    { id: 'failed', label: 'Failed', count: counts.failed },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Counselling bookings"
        subtitle="Student name, scheduled slot, and whether Cashfree payment is complete."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatus(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === f.id
                  ? 'border-educture-orange bg-educture-orange text-white'
                  : 'border-orange-100 bg-white text-gray-600 hover:border-orange-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-orange-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <label className={`${dashboardCardBorder} border-orange-100 bg-white rounded-2xl px-4 py-3 flex items-center gap-3`}>
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone, order id…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </label>

        {loading && (
          <div className={`${dashboardCardBorder} border-orange-100 rounded-2xl bg-white p-6 text-sm text-gray-500`}>
            Loading counselling bookings…
          </div>
        )}

        {!loading && error && (
          <div className={`${dashboardCardBorder} border-rose-200 rounded-2xl bg-rose-50 p-6 text-sm text-rose-700`}>
            {error}
            <p className="mt-2 text-xs text-rose-600/80">
              Make sure your Clerk user id is in <code className="font-mono">ADMIN_CLERK_USER_IDS</code> and{' '}
              <code className="font-mono">NEXT_PUBLIC_ADMIN_CLERK_USER_IDS</code>.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className={`${dashboardCardBorder} border-dashed border-orange-200 rounded-2xl bg-white p-8 text-center`}>
            <p className="text-sm text-gray-500">No counselling bookings match this filter.</p>
            <Link to="/admin" className="inline-block mt-3 text-sm font-semibold text-educture-orange hover:underline">
              Back to overview
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((booking) => {
              const topic = counsellingTopicById(booking.categoryId)
              const group = booking.groupId ? counsellingGroupById(booking.groupId) : undefined
              const schedule =
                booking.scheduledDate && booking.scheduledTime
                  ? formatScheduleLabel(booking.scheduledDate, booking.scheduledTime)
                  : 'Schedule not set'

              return (
                <article
                  key={`${booking.source}-${booking.id}`}
                  className={`${dashboardCardBorder} border-orange-100 rounded-2xl bg-white p-5 text-left`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-educture-orange">
                        {group?.title ?? 'Counselling'}
                      </p>
                      <h2 className="font-bold text-lg text-[#1d1d1d] mt-1 leading-snug">
                        {booking.fullName}
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {topic?.title ?? booking.categoryId}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${paymentBadge(booking.paymentStatus)}`}
                      >
                        {paymentLabel(booking.paymentStatus)}
                      </span>
                      {booking.assignmentStatus ? (
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${
                            booking.assignmentStatus === 'assigned'
                              ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                              : 'bg-orange-100 border-orange-200 text-orange-900'
                          }`}
                        >
                          {booking.assignmentStatus}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {booking.counsellorClerkId ? (
                    <p className="mt-2 text-xs text-gray-500">
                      Counsellor: <span className="font-mono">{booking.counsellorClerkId}</span>
                    </p>
                  ) : booking.paymentStatus === 'paid' ? (
                    <p className="mt-2 text-xs text-orange-700 font-medium">
                      Unassigned — assign a counsellor from Counsellor management.
                    </p>
                  ) : null}

                  <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-educture-orange shrink-0" />
                      <span>{schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.preferredMode === 'meet' ? (
                        <Video className="w-4 h-4 text-educture-orange shrink-0" />
                      ) : (
                        <Phone className="w-4 h-4 text-educture-orange shrink-0" />
                      )}
                      <span>{booking.preferredMode === 'meet' ? 'Google Meet' : 'Phone call'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                    <a href={`mailto:${booking.email}`} className="hover:text-educture-orange">
                      {booking.email}
                    </a>
                    <a href={`tel:+91${booking.phone}`} className="hover:text-educture-orange">
                      +91 {booking.phone}
                    </a>
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                      <IndianRupee className="w-3 h-3" />
                      {booking.amountInr || COUNSELLING_PRICE_INR}
                    </span>
                    {booking.cashfreeOrderId && (
                      <span className="font-mono text-[10px] text-gray-400">{booking.cashfreeOrderId}</span>
                    )}
                  </div>

                  {booking.note && (
                    <p className="mt-3 text-xs text-gray-600 bg-[#fff9f3] rounded-xl border border-orange-100 px-3 py-2">
                      <span className="font-semibold text-gray-700">Note: </span>
                      {booking.note}
                    </p>
                  )}

                  <p className="mt-3 text-[10px] text-gray-400">
                    Booked {new Date(booking.createdAt).toLocaleString('en-IN')}
                    {booking.source === 'pending' ? ' · checkout started, payment not confirmed' : ''}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

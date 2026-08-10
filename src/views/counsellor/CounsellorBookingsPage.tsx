'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CounsellorPageHeader } from '../../components/layout/CounsellorLayout'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  fetchCounsellorBookings,
  patchCounsellorBookingStatus,
  type CounsellorBooking,
} from '../../lib/counsellorDashboardApi'

export function CounsellorBookingsPage() {
  const { getToken } = useAuth()
  const [bookings, setBookings] = useState<CounsellorBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setBookings(await fetchCounsellorBookings(getToken))
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

  const filtered = useMemo(() => {
    if (filter === 'all') return bookings
    return bookings.filter((b) => b.sessionStatus === filter)
  }, [bookings, filter])

  async function markCompleted(id: string) {
    setBusyId(id)
    try {
      await patchCounsellorBookingStatus(getToken, id, 'completed')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update booking')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <CounsellorPageHeader
        title="Bookings"
        subtitle="Sessions auto-assigned to you. Mark completed when done."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'upcoming', 'completed'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                filter === id
                  ? 'border-educture-orange bg-educture-orange/10 text-educture-orange'
                  : 'border-orange-100 bg-white text-gray-600'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <DataTable
          loading={loading}
          rows={filtered}
          emptyTitle="No sessions assigned"
          emptyDescription="When students book matching types and you are available, bookings appear here."
          columns={[
            {
              key: 'student',
              header: 'Student',
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.fullName}</p>
                  <p className="text-xs text-gray-500">{row.email}</p>
                </div>
              ),
            },
            {
              key: 'when',
              header: 'Schedule',
              cell: (row) => (
                <span className="text-sm">
                  {row.scheduledDate || '—'} {row.scheduledTime || ''}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => (
                <StatusBadge
                  label={row.sessionStatus}
                  tone={row.sessionStatus === 'completed' ? 'completed' : 'upcoming'}
                />
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              cell: (row) =>
                row.sessionStatus === 'upcoming' ? (
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => void markCompleted(row.id)}
                    className="rounded-lg border border-orange-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-educture-orange"
                  >
                    Mark completed
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">Done</span>
                ),
            },
          ]}
        />
      </div>
    </div>
  )
}

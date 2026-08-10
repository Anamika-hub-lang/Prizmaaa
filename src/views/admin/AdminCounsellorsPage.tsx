'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { EmptyState, LoadingBlock, StatusBadge } from '../../components/ui/StatusBadge'
import {
  fetchAdminCounsellors,
  patchAdminCounsellor,
  type AdminCounsellorRow,
  type CounsellingTypeRow,
} from '../../lib/adminDashboardApi'

export function AdminCounsellorsPage() {
  const { getToken } = useAuth()
  const [counsellors, setCounsellors] = useState<AdminCounsellorRow[]>([])
  const [types, setTypes] = useState<CounsellingTypeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminCounsellors(getToken)
      setCounsellors(data.counsellors)
      setTypes(data.types)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load counsellors')
      setCounsellors([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function saveTypes(clerkId: string, typeIds: string[]) {
    setBusyId(clerkId)
    try {
      await patchAdminCounsellor(getToken, { clerkId, typeIds })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update types')
    } finally {
      setBusyId(null)
    }
  }

  async function toggleAvailability(clerkId: string, availability: boolean) {
    setBusyId(clerkId)
    try {
      await patchAdminCounsellor(getToken, { clerkId, availability })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update availability')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Counsellor management"
        subtitle="Assign counselling types (multi-select), toggle availability, and review bookings."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {loading ? <LoadingBlock label="Loading counsellors…" /> : null}
        {!loading && counsellors.length === 0 ? (
          <EmptyState
            title="No counsellors yet"
            description="Assign the counsellor role from Users management, then set types here."
          />
        ) : null}
        <div className="grid gap-4">
          {counsellors.map((c) => (
            <div key={c.clerkId} className="rounded-2xl border border-orange-100 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1d1d1d]">{c.fullName || 'Unnamed counsellor'}</p>
                  <p className="text-xs text-gray-500">{c.email || c.clerkId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={c.availability ? 'Available' : 'Unavailable'}
                    tone={c.availability ? 'approved' : 'rejected'}
                  />
                  <button
                    type="button"
                    disabled={busyId === c.clerkId}
                    onClick={() => void toggleAvailability(c.clerkId, !c.availability)}
                    className="rounded-lg border border-orange-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-educture-orange"
                  >
                    Toggle
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                  Assigned types
                </p>
                <div className="flex flex-wrap gap-2">
                  {types.map((t) => {
                    const active = c.typeIds.includes(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={busyId === c.clerkId}
                        onClick={() => {
                          const next = active
                            ? c.typeIds.filter((id) => id !== t.id)
                            : [...c.typeIds, t.id]
                          void saveTypes(c.clerkId, next)
                        }}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          active
                            ? 'border-educture-orange bg-educture-orange/10 text-educture-orange'
                            : 'border-orange-100 text-gray-600'
                        }`}
                      >
                        {t.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                  Bookings ({c.bookings.length})
                </p>
                {c.bookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No assigned bookings yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {c.bookings.slice(0, 5).map((b) => (
                      <li
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#fff9f3] px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{b.fullName}</span>
                        <StatusBadge
                          label={b.sessionStatus || 'upcoming'}
                          tone={b.sessionStatus === 'completed' ? 'completed' : 'upcoming'}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

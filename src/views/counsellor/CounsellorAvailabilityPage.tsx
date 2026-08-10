'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CounsellorPageHeader } from '../../components/layout/CounsellorLayout'
import { LoadingBlock, StatusBadge } from '../../components/ui/StatusBadge'
import {
  fetchCounsellorMe,
  patchCounsellorAvailability,
} from '../../lib/counsellorDashboardApi'

export function CounsellorAvailabilityPage() {
  const { getToken } = useAuth()
  const [availability, setAvailability] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await fetchCounsellorMe(getToken)
      setAvailability(me.availability)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load availability')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function toggle() {
    setSaving(true)
    setError(null)
    try {
      const next = !availability
      await patchCounsellorAvailability(getToken, next)
      setAvailability(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update availability')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <CounsellorPageHeader
        title="Availability"
        subtitle="Only available counsellors are auto-assigned to new bookings."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {error ? <p className="text-sm text-rose-600 mb-4">{error}</p> : null}
        {loading ? (
          <LoadingBlock />
        ) : (
          <div className="rounded-2xl border border-orange-100 bg-white p-6 max-w-lg space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[#1d1d1d]">Current status</p>
                <p className="text-sm text-gray-500 mt-1">
                  Toggle when you can take new counselling sessions.
                </p>
              </div>
              <StatusBadge
                label={availability ? 'Available' : 'Unavailable'}
                tone={availability ? 'approved' : 'rejected'}
              />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void toggle()}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 ${
                availability ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {saving
                ? 'Updating…'
                : availability
                  ? 'Set unavailable'
                  : 'Set available'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

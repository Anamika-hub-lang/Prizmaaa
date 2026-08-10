'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CounsellorPageHeader } from '../../components/layout/CounsellorLayout'
import { EmptyState, LoadingBlock, StatusBadge } from '../../components/ui/StatusBadge'
import { fetchCounsellorMe, type CounsellorType } from '../../lib/counsellorDashboardApi'

export function CounsellorTypesPage() {
  const { getToken } = useAuth()
  const [types, setTypes] = useState<CounsellorType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await fetchCounsellorMe(getToken)
      setTypes(me.types)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load types')
      setTypes([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div>
      <CounsellorPageHeader
        title="Assigned types"
        subtitle="Counselling types an admin has assigned to your account."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {loading ? <LoadingBlock /> : null}
        {!loading && types.length === 0 ? (
          <EmptyState
            title="No types assigned"
            description="Ask an admin to assign Career, Abroad, Tech, or other counselling types."
          />
        ) : null}
        <div className="flex flex-wrap gap-3">
          {types.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-orange-100 bg-white px-5 py-4 min-w-[12rem]"
            >
              <StatusBadge label={t.name} tone="neutral" />
              <p className="text-sm text-gray-500 mt-2">{t.subdomain}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fetchCommissions, patchCommission, type UniversityCommission } from '../../lib/universityLeadsApi'

const COMMISSION_STATUSES = ['pending', 'invoiced', 'paid', 'cancelled'] as const

function tone(status: string) {
  if (status === 'paid') return 'approved' as const
  if (status === 'cancelled') return 'rejected' as const
  if (status === 'invoiced') return 'upcoming' as const
  return 'pending' as const
}

export function AdminCommissionsPage() {
  const { getToken } = useAuth()
  const [rows, setRows] = useState<UniversityCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchCommissions(getToken))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load commissions')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function update(
    row: UniversityCommission,
    patch: { commissionStatus?: string; paymentReceivedAt?: string | null; commissionAmountInr?: number },
  ) {
    setBusyId(row.id)
    setError(null)
    try {
      await patchCommission(getToken, { id: row.id, ...patch })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update commission')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="University commissions"
        subtitle="Lead → university → application → admission → commission. Amounts are created when a lead reaches application or admission."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <DataTable
          loading={loading}
          rows={rows}
          emptyTitle="No commission rows yet"
          emptyDescription="When a counsellor marks a lead as Application started or Admitted, a commission record is created for the matched partner."
          columns={[
            {
              key: 'lead',
              header: 'Lead ID',
              cell: (row) => <span className="font-mono text-[11px]">{row.lead_id.slice(0, 8)}…</span>,
            },
            {
              key: 'uni',
              header: 'University ID',
              cell: (row) => row.university_id,
            },
            {
              key: 'app',
              header: 'Application',
              cell: (row) => row.application_status,
            },
            {
              key: 'adm',
              header: 'Admission',
              cell: (row) => row.admission_status,
            },
            {
              key: 'amt',
              header: 'Commission (₹)',
              cell: (row) => (
                <input
                  type="number"
                  min={0}
                  defaultValue={row.commission_amount_inr}
                  disabled={busyId === row.id}
                  className="w-24 rounded-lg border border-orange-100 px-2 py-1 text-sm"
                  onBlur={(e) => {
                    const next = Number(e.target.value) || 0
                    if (next !== Number(row.commission_amount_inr)) {
                      void update(row, { commissionAmountInr: next })
                    }
                  }}
                />
              ),
            },
            {
              key: 'status',
              header: 'Commission status',
              cell: (row) => (
                <select
                  value={row.commission_status}
                  disabled={busyId === row.id}
                  onChange={(e) => void update(row, { commissionStatus: e.target.value })}
                  className="rounded-lg border border-orange-100 px-2 py-1 text-xs font-semibold"
                >
                  {COMMISSION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ),
            },
            {
              key: 'badge',
              header: '',
              cell: (row) => <StatusBadge label={row.commission_status} tone={tone(row.commission_status)} />,
            },
            {
              key: 'paid',
              header: 'Payment received',
              cell: (row) => (
                <input
                  type="date"
                  defaultValue={row.payment_received_at?.slice(0, 10) ?? ''}
                  disabled={busyId === row.id}
                  className="rounded-lg border border-orange-100 px-2 py-1 text-xs"
                  onChange={(e) =>
                    void update(row, { paymentReceivedAt: e.target.value ? e.target.value : null })
                  }
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

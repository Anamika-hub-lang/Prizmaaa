'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  fetchAdminUploads,
  reviewAdminUpload,
  type AdminUploadRow,
} from '../../lib/adminDashboardApi'

function uploadTone(status: string) {
  if (status === 'approved') return 'approved' as const
  if (status === 'rejected') return 'rejected' as const
  return 'pending' as const
}

export function AdminUploadsPage() {
  const { getToken } = useAuth()
  const [uploads, setUploads] = useState<AdminUploadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schemaHint, setSchemaHint] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSchemaHint(null)
    try {
      const data = await fetchAdminUploads(getToken)
      setUploads(data.uploads)
      if (data.schemaMissing) {
        setSchemaHint(
          data.hint ||
            'Database table csv_uploads is missing. Run supabase/roles-counselling-uploads.sql in Supabase.',
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load uploads')
      setUploads([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function review(id: string, action: 'approve' | 'reject') {
    setBusyId(id)
    setError(null)
    try {
      await reviewAdminUpload(getToken, id, action)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${action}`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="CSV upload approval"
        subtitle="Approve pending intern uploads to insert class rows into the catalog. Reject leaves classes unchanged."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {schemaHint ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {schemaHint}
          </div>
        ) : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <DataTable
          loading={loading}
          rows={uploads}
          emptyTitle="No uploads yet"
          emptyDescription={
            schemaHint
              ? 'Apply the SQL migration first, then intern uploads will appear here.'
              : 'Intern CSV submissions will appear here for approval.'
          }
          columns={[
            {
              key: 'file',
              header: 'File name',
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.fileName}</p>
                  <p className="text-xs text-gray-500">{row.rowCount} rows</p>
                </div>
              ),
            },
            {
              key: 'by',
              header: 'Uploaded by',
              cell: (row) => <span className="text-sm">{row.uploadedBy}</span>,
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => <StatusBadge label={row.status} tone={uploadTone(row.status)} />,
            },
            {
              key: 'actions',
              header: 'Actions',
              cell: (row) =>
                row.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => void review(row.id, 'approve')}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => void review(row.id, 'reject')}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                ),
            },
          ]}
        />
      </div>
    </div>
  )
}

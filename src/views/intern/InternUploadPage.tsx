'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { InternPageHeader } from '../../components/layout/InternLayout'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  fetchInternUploads,
  postInternUpload,
  type InternUploadRow,
} from '../../lib/internDashboardApi'

function uploadTone(status: string) {
  if (status === 'approved') return 'approved' as const
  if (status === 'rejected') return 'rejected' as const
  return 'pending' as const
}

export function InternUploadPage() {
  const { getToken } = useAuth()
  const [uploads, setUploads] = useState<InternUploadRow[]>([])
  const [templateHint, setTemplateHint] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchInternUploads(getToken)
      setUploads(data.uploads)
      setTemplateHint(data.templateHint)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load history')
      setUploads([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function onFile(file: File | null) {
    if (!file) return
    setUploading(true)
    setError(null)
    setSuccess(null)
    try {
      const csvText = await file.text()
      await postInternUpload(getToken, { fileName: file.name, csvText })
      setSuccess(`Uploaded ${file.name} — waiting for admin approval.`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <InternPageHeader
        title="Upload CSV"
        subtitle="Validate and submit class catalog rows. Data becomes active only after admin approval."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="rounded-2xl border border-orange-100 bg-white p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Required columns:{' '}
            <code className="text-xs bg-[#fff9f3] px-1.5 py-0.5 rounded">
              id, title, category_id, mentor, duration, sessions, description, price
            </code>
          </p>
          {templateHint ? (
            <p className="text-xs text-gray-400 break-all">Template: {templateHint}</p>
          ) : null}
          <label className="inline-flex cursor-pointer items-center rounded-xl bg-educture-orange px-4 py-2.5 text-sm font-semibold text-white">
            {uploading ? 'Uploading…' : 'Upload CSV'}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={uploading}
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <div>
          <h2 className="font-display text-xl text-[#1d1d1d] mb-3">Upload history</h2>
          <DataTable
            loading={loading}
            rows={uploads}
            emptyTitle="No uploads yet"
            emptyDescription="Your CSV submissions will show pending / approved / rejected here."
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
                key: 'status',
                header: 'Status',
                cell: (row) => <StatusBadge label={row.status} tone={uploadTone(row.status)} />,
              },
              {
                key: 'created',
                header: 'Uploaded',
                cell: (row) => (
                  <span className="text-xs text-gray-500">
                    {new Date(row.createdAt).toLocaleString()}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

export function InternHistoryPage() {
  return <InternUploadPage />
}

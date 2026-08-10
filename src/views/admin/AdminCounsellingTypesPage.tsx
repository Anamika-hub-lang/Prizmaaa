'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  createAdminCounsellingType,
  deleteAdminCounsellingType,
  fetchAdminCounsellingTypes,
  updateAdminCounsellingType,
  type CounsellingTypeRow,
} from '../../lib/adminDashboardApi'

export function AdminCounsellingTypesPage() {
  const { getToken } = useAuth()
  const [types, setTypes] = useState<CounsellingTypeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTypes(await fetchAdminCounsellingTypes(getToken))
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

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createAdminCounsellingType(getToken, { name, subdomain })
      setName('')
      setSubdomain('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create type')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Counselling system"
        subtitle="Create counselling types with display names and subdomains (e.g. career.prizma.com)."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <form
          onSubmit={(e) => void onCreate(e)}
          className="rounded-2xl border border-orange-100 bg-white p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type name (Career)"
            className="rounded-xl border border-orange-100 px-3 py-2 text-sm"
            required
          />
          <input
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder="Subdomain (career.prizma.com)"
            className="rounded-xl border border-orange-100 px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-educture-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add type'}
          </button>
        </form>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <DataTable
          loading={loading}
          rows={types}
          emptyTitle="No counselling types"
          emptyDescription="Add Career, Abroad, Tech, or custom types."
          columns={[
            {
              key: 'name',
              header: 'Name',
              cell: (row) => <span className="font-medium">{row.name}</span>,
            },
            {
              key: 'subdomain',
              header: 'Subdomain',
              cell: (row) => <StatusBadge label={row.subdomain} tone="neutral" />,
            },
            {
              key: 'slug',
              header: 'Slug',
              cell: (row) => <span className="text-xs text-gray-500">{row.slug}</span>,
            },
            {
              key: 'actions',
              header: 'Actions',
              cell: (row) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-educture-orange"
                    onClick={() => {
                      const nextName = window.prompt('Name', row.name)
                      const nextSub = window.prompt('Subdomain', row.subdomain)
                      if (!nextName && !nextSub) return
                      void updateAdminCounsellingType(getToken, {
                        id: row.id,
                        name: nextName || undefined,
                        subdomain: nextSub || undefined,
                      })
                        .then(load)
                        .catch((err) =>
                          setError(err instanceof Error ? err.message : 'Update failed'),
                        )
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-600"
                    onClick={() => {
                      if (!window.confirm(`Delete ${row.name}?`)) return
                      void deleteAdminCounsellingType(getToken, row.id)
                        .then(load)
                        .catch((err) =>
                          setError(err instanceof Error ? err.message : 'Delete failed'),
                        )
                    }}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

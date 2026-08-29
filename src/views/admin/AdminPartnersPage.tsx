'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'
import { createPartner, fetchPartners, type UniversityPartner } from '../../lib/universityLeadsApi'

const inputClass =
  'w-full mt-1 px-3 py-2 rounded-xl border border-orange-100 bg-white text-sm outline-none focus:border-educture-orange'

export function AdminPartnersPage() {
  const { getToken } = useAuth()
  const [partners, setPartners] = useState<UniversityPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    universityId: '',
    name: '',
    shortName: '',
    location: '',
    state: '',
    website: '',
    admissionInfo: '',
    clerkId: '',
    leadCommissionInr: '0',
    admissionCommissionInr: '0',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPartners(await fetchPartners(getToken))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load partners')
      setPartners([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createPartner(getToken, {
        universityId: form.universityId.trim(),
        name: form.name.trim(),
        shortName: form.shortName.trim(),
        location: form.location.trim(),
        state: form.state.trim(),
        website: form.website.trim(),
        admissionInfo: form.admissionInfo.trim(),
        clerkId: form.clerkId.trim(),
        leadCommissionInr: Number(form.leadCommissionInr) || 0,
        admissionCommissionInr: Number(form.admissionCommissionInr) || 0,
      })
      setForm({
        universityId: '',
        name: '',
        shortName: '',
        location: '',
        state: '',
        website: '',
        admissionInfo: '',
        clerkId: '',
        leadCommissionInr: '0',
        admissionCommissionInr: '0',
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create partner')
    } finally {
      setSaving(false)
    }
  }

  const totals = partners.reduce(
    (acc, p) => {
      acc.leads += p.stats?.leads ?? 0
      acc.applications += p.stats?.applications ?? 0
      acc.admissions += p.stats?.admissions ?? 0
      return acc
    },
    { leads: 0, applications: 0, admissions: 0 },
  )

  return (
    <div>
      <AdminPageHeader
        title="University partners"
        subtitle="Campus profiles, programmes, and lead volume. Student phone numbers stay hidden until consent + share."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: 'Leads received', value: totals.leads, tint: 0 },
            { label: 'Applications', value: totals.applications, tint: 1 },
            { label: 'Admissions', value: totals.admissions, tint: 2 },
          ].map((card) => {
            const tint = dashboardTint(card.tint)
            return (
              <div
                key={card.label}
                className={`${dashboardCardBorder} ${tint.bg} ${tint.border} rounded-2xl p-4`}
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-[#1d1d1d] mt-1">{card.value}</p>
              </div>
            )
          })}
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <form
          onSubmit={(e) => void onCreate(e)}
          className="rounded-2xl border border-orange-100 bg-white p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          <p className="sm:col-span-2 lg:col-span-3 font-semibold text-sm">Add partner campus</p>
          <label className="text-xs font-semibold text-gray-500">
            University ID
            <input
              required
              className={inputClass}
              value={form.universityId}
              onChange={(e) => setForm({ ...form, universityId: e.target.value })}
              placeholder="vit-vellore"
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Name
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Short name
            <input
              className={inputClass}
              value={form.shortName}
              onChange={(e) => setForm({ ...form, shortName: e.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Location
            <input
              className={inputClass}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            State
            <input
              className={inputClass}
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Website
            <input
              className={inputClass}
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500 sm:col-span-2">
            Admission information
            <input
              className={inputClass}
              value={form.admissionInfo}
              onChange={(e) => setForm({ ...form, admissionInfo: e.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Partner Clerk user ID
            <input
              className={inputClass}
              value={form.clerkId}
              onChange={(e) => setForm({ ...form, clerkId: e.target.value })}
              placeholder="user_…"
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Lead commission (₹)
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.leadCommissionInr}
              onChange={(e) => setForm({ ...form, leadCommissionInr: e.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Admission commission (₹)
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.admissionCommissionInr}
              onChange={(e) => setForm({ ...form, admissionCommissionInr: e.target.value })}
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-educture-orange px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Create partner'}
            </button>
          </div>
        </form>

        <DataTable
          loading={loading}
          rows={partners}
          emptyTitle="No partners yet"
          emptyDescription="Add a partnered campus, then link a Clerk user ID so they can open /partner."
          columns={[
            {
              key: 'name',
              header: 'University',
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.university_id}</p>
                </div>
              ),
            },
            {
              key: 'place',
              header: 'Location',
              cell: (row) => [row.location, row.state].filter(Boolean).join(', ') || '—',
            },
            {
              key: 'leads',
              header: 'Leads',
              cell: (row) => row.stats?.leads ?? 0,
            },
            {
              key: 'apps',
              header: 'Applications',
              cell: (row) => row.stats?.applications ?? 0,
            },
            {
              key: 'admits',
              header: 'Admissions',
              cell: (row) => row.stats?.admissions ?? 0,
            },
            {
              key: 'active',
              header: 'Status',
              cell: (row) => (
                <StatusBadge label={row.is_active ? 'Active' : 'Inactive'} tone={row.is_active ? 'approved' : 'rejected'} />
              ),
            },
            {
              key: 'open',
              header: '',
              cell: (row) => (
                <Link
                  to={`/admin/partners/${row.id}`}
                  className="rounded-lg border border-orange-100 px-3 py-1.5 text-xs font-semibold hover:border-educture-orange"
                >
                  Profile
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

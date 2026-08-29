'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { PartnerPageHeader } from '../../components/layout/PartnerLayout'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'
import { UNIVERSITY_LEAD_STATUS_LABELS } from '../../data/universityLeadFields'
import {
  fetchPartnerDashboard,
  fetchPartnerMe,
  type PartnerProgram,
  type UniversityLead,
  type UniversityPartner,
} from '../../lib/universityLeadsApi'

export function PartnerDashboardPage() {
  const { getToken } = useAuth()
  const [partner, setPartner] = useState<UniversityPartner | null>(null)
  const [programs, setPrograms] = useState<PartnerProgram[]>([])
  const [stats, setStats] = useState({ leads: 0, applications: 0, admissions: 0, shared: 0 })
  const [leads, setLeads] = useState<UniversityLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await fetchPartnerMe(getToken)
      setPartner(me.partner)
      setPrograms(me.programs)
      const dash = await fetchPartnerDashboard(getToken)
      setStats(dash.stats)
      setLeads(dash.leads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load partner dashboard')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div>
      <PartnerPageHeader
        title={partner?.name ?? 'Partner dashboard'}
        subtitle="Matched, consented student contacts only. Aggregate lead counts do not include unpublished phone numbers."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="grid sm:grid-cols-4 gap-3">
          {[
            { label: 'Leads received', value: stats.leads, tint: 0 },
            { label: 'Shared contacts', value: stats.shared, tint: 1 },
            { label: 'Applications', value: stats.applications, tint: 2 },
            { label: 'Admissions', value: stats.admissions, tint: 3 },
          ].map((card) => {
            const tint = dashboardTint(card.tint)
            return (
              <div key={card.label} className={`${dashboardCardBorder} ${tint.bg} ${tint.border} rounded-2xl p-4`}>
                <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{loading ? '…' : card.value}</p>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-orange-100 bg-white p-5">
            <h2 className="font-semibold">University profile</h2>
            <p className="text-sm text-gray-600 mt-2">
              {[partner?.location, partner?.state].filter(Boolean).join(', ') || 'Location not set'}
            </p>
            {partner?.website ? (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-educture-orange mt-2 inline-block"
              >
                Website
              </a>
            ) : null}
            <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">
              {partner?.admission_info || 'No admission notes yet.'}
            </p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-white p-5">
            <h2 className="font-semibold">Courses / programmes</h2>
            <ul className="mt-3 space-y-2">
              {programs.length === 0 ? (
                <li className="text-sm text-gray-400">No programmes listed.</li>
              ) : (
                programs.map((p) => (
                  <li key={p.id} className="text-sm">
                    <span className="font-medium">{p.name}</span>
                    {p.fees_inr != null ? (
                      <span className="text-gray-500"> · ₹{p.fees_inr.toLocaleString('en-IN')}</span>
                    ) : null}
                    {p.eligibility ? <p className="text-xs text-gray-500">{p.eligibility}</p> : null}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <DataTable
          loading={loading}
          rows={leads}
          emptyTitle="No shared student contacts yet"
          emptyDescription="PRIZMA only shares a student's phone and email after they consent and a counsellor matches them to your campus."
          columns={[
            {
              key: 'student',
              header: 'Student',
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.full_name}</p>
                  <p className="text-xs text-gray-500">{row.email}</p>
                </div>
              ),
            },
            {
              key: 'phone',
              header: 'Phone',
              cell: (row) => <span className="font-mono text-xs">{row.phone || '—'}</span>,
            },
            {
              key: 'course',
              header: 'Course',
              cell: (row) => row.course,
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => (
                <StatusBadge label={UNIVERSITY_LEAD_STATUS_LABELS[row.status]} tone="neutral" />
              ),
            },
            {
              key: 'created',
              header: 'Created',
              cell: (row) => new Date(row.created_at).toLocaleDateString('en-IN'),
            },
          ]}
        />
      </div>
    </div>
  )
}

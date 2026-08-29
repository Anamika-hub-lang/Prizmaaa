'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Search } from 'lucide-react'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge, type StatusTone } from '../../components/ui/StatusBadge'
import {
  UNIVERSITY_LEAD_SOURCE_LABELS,
  UNIVERSITY_LEAD_STATUSES,
  UNIVERSITY_LEAD_STATUS_LABELS,
  type UniversityLeadStatus,
} from '../../data/universityLeadFields'
import { fetchAdminCounsellors, type AdminCounsellorRow } from '../../lib/adminDashboardApi'
import {
  addLeadNote,
  fetchLeadNotes,
  fetchStaffLeads,
  patchStaffLead,
  shareLeadWithPartner,
  type UniversityLead,
} from '../../lib/universityLeadsApi'

const selectClass =
  'rounded-lg border border-orange-100 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700'

function statusTone(status: UniversityLeadStatus): StatusTone {
  switch (status) {
    case 'NEW':
      return 'pending'
    case 'CONTACTED':
      return 'upcoming'
    case 'COUNSELLING':
      return 'assigned'
    case 'INTERESTED':
      return 'approved'
    case 'APPLICATION_STARTED':
      return 'upcoming'
    case 'ADMITTED':
      return 'completed'
    case 'CLOSED':
      return 'rejected'
    default:
      return 'neutral'
  }
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function StaffUniversityLeadsPage({
  asCounsellor,
  header,
}: {
  asCounsellor: boolean
  header: ReactNode
}) {
  const { getToken } = useAuth()
  const [leads, setLeads] = useState<UniversityLead[]>([])
  const [counsellors, setCounsellors] = useState<AdminCounsellorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | UniversityLeadStatus>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Array<{ id: string; body: string; created_at: string }>>([])
  const [noteBody, setNoteBody] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await fetchStaffLeads(getToken, asCounsellor)
      setLeads(next)
      if (!asCounsellor) {
        const data = await fetchAdminCounsellors(getToken)
        setCounsellors(data.counsellors)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load leads')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [getToken, asCounsellor])

  useEffect(() => {
    void load()
  }, [load])

  const selected = useMemo(
    () => leads.find((lead) => lead.id === selectedId) ?? null,
    [leads, selectedId],
  )

  useEffect(() => {
    if (!selected) {
      setNotes([])
      setNoteBody('')
      setFollowUp('')
      return
    }
    setFollowUp(toDatetimeLocal(selected.follow_up_at))
    void fetchLeadNotes(getToken, selected.id, asCounsellor)
      .then(setNotes)
      .catch(() => setNotes([]))
  }, [selected, getToken, asCounsellor])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (!q) return true
      const hay = [
        lead.full_name,
        lead.email,
        lead.phone ?? '',
        lead.course,
        lead.university_name,
        lead.assignedCounsellorName ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [leads, query, statusFilter])

  async function saveStatus(leadId: string, status: UniversityLeadStatus) {
    setBusy(true)
    setError(null)
    try {
      await patchStaffLead(getToken, leadId, { status }, asCounsellor)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status')
    } finally {
      setBusy(false)
    }
  }

  async function saveCounsellor(leadId: string, clerkId: string) {
    setBusy(true)
    setError(null)
    try {
      await patchStaffLead(
        getToken,
        leadId,
        { assignedCounsellorClerkId: clerkId || null },
        asCounsellor,
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not assign counsellor')
    } finally {
      setBusy(false)
    }
  }

  async function saveFollowUp() {
    if (!selected) return
    setBusy(true)
    setError(null)
    try {
      await patchStaffLead(
        getToken,
        selected.id,
        { followUpAt: followUp ? new Date(followUp).toISOString() : null },
        asCounsellor,
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save follow-up')
    } finally {
      setBusy(false)
    }
  }

  async function saveNote() {
    if (!selected || !noteBody.trim()) return
    setBusy(true)
    setError(null)
    try {
      await addLeadNote(getToken, selected.id, noteBody.trim(), asCounsellor)
      setNoteBody('')
      setNotes(await fetchLeadNotes(getToken, selected.id, asCounsellor))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add note')
    } finally {
      setBusy(false)
    }
  }

  async function shareLead() {
    if (!selected) return
    setBusy(true)
    setError(null)
    try {
      await shareLeadWithPartner(getToken, selected.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not share lead')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {header}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, campus, course…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-orange-100 bg-white text-sm outline-none focus:border-educture-orange"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value === 'all' ? 'all' : (e.target.value as UniversityLeadStatus))
            }
            className="rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-sm"
          >
            <option value="all">All statuses</option>
            {UNIVERSITY_LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {UNIVERSITY_LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <DataTable
          loading={loading}
          rows={filtered}
          emptyTitle="No university leads yet"
          emptyDescription="When a student taps Get counselling, I'm interested, or Apply, they appear here."
          columns={[
            {
              key: 'student',
              header: 'Student',
              cell: (row) => (
                <div>
                  <p className="font-medium text-[#1d1d1d]">{row.full_name}</p>
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
              key: 'university',
              header: 'University',
              cell: (row) => row.university_name,
            },
            {
              key: 'source',
              header: 'Source',
              cell: (row) => UNIVERSITY_LEAD_SOURCE_LABELS[row.source],
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => (
                <StatusBadge label={UNIVERSITY_LEAD_STATUS_LABELS[row.status]} tone={statusTone(row.status)} />
              ),
            },
            {
              key: 'counsellor',
              header: 'Counsellor',
              cell: (row) => row.assignedCounsellorName || 'Unassigned',
            },
            {
              key: 'created',
              header: 'Created',
              cell: (row) => formatDate(row.created_at),
            },
            {
              key: 'open',
              header: '',
              cell: (row) => (
                <button
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  className="rounded-lg border border-orange-100 px-3 py-1.5 text-xs font-semibold hover:border-educture-orange"
                >
                  Manage
                </button>
              ),
            },
          ]}
        />

        {selected ? (
          <div className="rounded-2xl border border-orange-100 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg text-[#1d1d1d]">{selected.full_name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selected.email} · {selected.phone} · {selected.qualification}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selected.course} at {selected.university_name}
                  {selected.preferred_location ? ` · prefers ${selected.preferred_location}` : ''}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedId(null)} className="text-xs text-gray-500">
                Close
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="text-xs font-semibold text-gray-500">
                Status
                <select
                  className={`${selectClass} mt-1 w-full`}
                  value={selected.status}
                  disabled={busy}
                  onChange={(e) => void saveStatus(selected.id, e.target.value as UniversityLeadStatus)}
                >
                  {UNIVERSITY_LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {UNIVERSITY_LEAD_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
              {!asCounsellor ? (
                <label className="text-xs font-semibold text-gray-500">
                  Assigned counsellor
                  <select
                    className={`${selectClass} mt-1 w-full`}
                    value={selected.assigned_counsellor_clerk_id ?? ''}
                    disabled={busy}
                    onChange={(e) => void saveCounsellor(selected.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {counsellors.map((c) => (
                      <option key={c.clerkId} value={c.clerkId}>
                        {c.fullName || c.email || c.clerkId}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="text-xs font-semibold text-gray-500">
                Follow-up
                <span className="flex gap-2 mt-1">
                  <input
                    type="datetime-local"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className={`${selectClass} flex-1`}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void saveFollowUp()}
                    className="rounded-lg bg-educture-orange px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Save
                  </button>
                </span>
              </label>
            </div>

            {!asCounsellor ? (
              <div className="rounded-xl border border-orange-50 bg-[#fff9f3] p-3 text-sm">
                {selected.share_consent ? (
                  selected.sharedWithPartner ? (
                    <p className="text-emerald-800">Contact already shared with the matched partner campus.</p>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void shareLead()}
                      className="rounded-lg bg-educture-orange px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Share contact with partner university
                    </button>
                  )
                ) : (
                  <p className="text-gray-600">
                    Student has not consented to share contact details. Do not send this lead to the university.
                  </p>
                )}
              </div>
            ) : null}

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Notes</p>
              <div className="flex gap-2">
                <input
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Add a follow-up note…"
                  className="flex-1 rounded-xl border border-orange-100 px-3 py-2 text-sm outline-none focus:border-educture-orange"
                />
                <button
                  type="button"
                  disabled={busy || !noteBody.trim()}
                  onClick={() => void saveNote()}
                  className="rounded-xl bg-educture-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Add
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {notes.length === 0 ? (
                  <li className="text-sm text-gray-400">No notes yet.</li>
                ) : (
                  notes.map((note) => (
                    <li key={note.id} className="rounded-xl border border-orange-50 bg-[#fffaf6] px-3 py-2 text-sm">
                      <p>{note.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{formatDate(note.created_at)}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

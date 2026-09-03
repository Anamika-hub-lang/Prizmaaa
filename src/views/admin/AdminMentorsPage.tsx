import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Check, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { dashboardCardBorder } from '../../components/ui/dashboardCardStyles'
import {
  addMentorAllowlistEmail,
  fetchMentorAllowlist,
  fetchMentorApplications,
  removeMentorAllowlistEmail,
  reviewMentorApplication,
  type MentorAllowlistEntry,
  type MentorApplicationRow,
} from '../../lib/adminMentors'

function statusBadge(status: MentorApplicationRow['status']) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-900 border-amber-200'
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'rejected':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

export function AdminMentorsPage() {
  const { getToken } = useAuth()
  const [emails, setEmails] = useState<MentorAllowlistEntry[]>([])
  const [applications, setApplications] = useState<MentorApplicationRow[]>([])
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [setupHint, setSetupHint] = useState<string | null>(null)

  const pendingApps = useMemo(
    () => applications.filter((a) => a.status === 'pending'),
    [applications],
  )
  const reviewedApps = useMemo(
    () => applications.filter((a) => a.status !== 'pending'),
    [applications],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [allow, apps] = await Promise.all([
        fetchMentorAllowlist(getToken),
        fetchMentorApplications(getToken),
      ])
      setEmails(allow.emails)
      setSetupHint(allow.setupRequired ? allow.error ?? 'Run mentor SQL in Supabase.' : null)
      setApplications(apps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load mentor data')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await addMentorAllowlistEmail(getToken, email, note)
      setEmail('')
      setNote('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add email')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(value: string) {
    setError(null)
    try {
      await removeMentorAllowlistEmail(getToken, value)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove email')
    }
  }

  async function handleReview(app: MentorApplicationRow, action: 'approve' | 'reject') {
    const label = action === 'approve' ? 'approve' : 'reject'
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} mentor request from ${app.fullName}?`)) {
      return
    }
    setReviewingId(app.id)
    setError(null)
    try {
      await reviewMentorApplication(getToken, app.id, action)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${label} application`)
    } finally {
      setReviewingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Review mentor requests → Approve adds their email → They sign up as Mentor → Upload classes.
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {setupHint && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {setupHint} Also run <code className="text-xs">supabase/mentor-applications-v2.sql</code>.
        </p>
      )}
      {error && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <section>
        <h2 className="font-bold text-[#1d1d1d] mb-3">
          Pending requests ({pendingApps.length})
        </h2>
        {pendingApps.length === 0 ? (
          <p className="text-sm text-gray-500">No pending mentor requests right now.</p>
        ) : (
          <div className="space-y-3">
            {pendingApps.map((app) => (
              <article
                key={app.id}
                className={`${dashboardCardBorder} border-orange-100 bg-white rounded-2xl p-5 text-left`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#1d1d1d]">{app.fullName}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusBadge(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {app.email}
                      {app.phone ? ` · ${app.phone}` : ''}
                    </p>
                    {app.college && (
                      <p className="text-xs text-gray-500 mt-1">College: {app.college}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={reviewingId === app.id}
                      onClick={() => void handleReview(app, 'approve')}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={reviewingId === app.id}
                      onClick={() => void handleReview(app, 'reject')}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-3">{app.expertise}</p>
                {app.experience && <p className="text-xs text-gray-500 mt-1">{app.experience}</p>}
                {app.portfolioUrl && (
                  <a
                    href={app.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-educture-orange font-semibold mt-2 inline-block hover:underline"
                  >
                    View portfolio →
                  </a>
                )}
                {app.message && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{app.message}</p>}
                {app.createdAt && (
                  <p className="text-[10px] text-gray-400 mt-3">
                    Submitted {new Date(app.createdAt).toLocaleString('en-IN')}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {reviewedApps.length > 0 && (
        <section>
          <h2 className="font-bold text-[#1d1d1d] mb-3">Past decisions ({reviewedApps.length})</h2>
          <div className="space-y-2">
            {reviewedApps.slice(0, 20).map((app) => (
              <div
                key={app.id}
                className={`${dashboardCardBorder} border-orange-100 bg-white rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1d1d1d]">{app.fullName}</p>
                  <p className="text-xs text-gray-500">{app.email} · {app.expertise}</p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusBadge(app.status)}`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-bold text-[#1d1d1d] mb-3">Manually allow email (optional)</h2>
        <form
          onSubmit={(e) => void handleAdd(e)}
          className={`${dashboardCardBorder} border-orange-100 bg-white rounded-2xl p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end`}
        >
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Mentor email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mentor@college.edu"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Subject / campus"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-educture-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-educture-orange-dark disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Adding…' : 'Allow email'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-bold text-[#1d1d1d] mb-3">Approved mentor emails ({emails.length})</h2>
        {emails.length === 0 ? (
          <p className="text-sm text-gray-500">No approved emails yet. Approve a request above.</p>
        ) : (
          <div className="space-y-2">
            {emails.map((item) => (
              <div
                key={item.id}
                className={`${dashboardCardBorder} border-orange-100 bg-white rounded-xl px-4 py-3 flex items-center justify-between gap-3`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#1d1d1d] truncate">{item.email}</p>
                    {item.permanent ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800">
                        Permanent
                      </span>
                    ) : null}
                  </div>
                  {item.note && <p className="text-xs text-gray-500">{item.note}</p>}
                </div>
                {item.permanent ? (
                  <span className="text-xs text-gray-400 shrink-0">Locked</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleRemove(item.email)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

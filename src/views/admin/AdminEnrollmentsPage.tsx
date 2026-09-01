import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { BookOpen, RefreshCw, Search } from 'lucide-react'
import { dashboardCardBorder } from '../../components/ui/dashboardCardStyles'
import {
  fetchAdminEnrollments,
  grantOfflineEnrollment,
  type AdminClassEnrollment,
  type AdminEnrollmentClassOption,
} from '../../lib/adminEnrollments'

export function AdminEnrollmentsPage() {
  const { getToken } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<AdminClassEnrollment[]>([])
  const [classes, setClasses] = useState<AdminEnrollmentClassOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [grantEmail, setGrantEmail] = useState('')
  const [grantClassId, setGrantClassId] = useState('')
  const [granting, setGranting] = useState(false)
  const [grantMessage, setGrantMessage] = useState<string | null>(null)
  const [grantError, setGrantError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminEnrollments(getToken)
      setRows(data.enrollments)
      setClasses(data.classes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load enrollments')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      [row.fullName, row.email, row.phone, row.classTitle, row.classId, row.planTier ?? '', row.status]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [rows, query])

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()
    setGranting(true)
    setGrantError(null)
    setGrantMessage(null)
    try {
      await grantOfflineEnrollment(getToken, {
        email: grantEmail,
        classId: grantClassId || undefined,
        classTitleQuery: grantClassId ? undefined : 'full stack',
      })
      setGrantMessage(`Enrolled ${grantEmail.trim()} as a student. Class updates will reach them like other students.`)
      setGrantEmail('')
      await load()
    } catch (err) {
      setGrantError(err instanceof Error ? err.message : 'Could not grant enrollment')
    } finally {
      setGranting(false)
    }
  }

  return (
    <div className="space-y-5">
        <form
          onSubmit={(e) => void handleGrant(e)}
          className={`${dashboardCardBorder} border-orange-100 bg-white rounded-2xl p-4 space-y-3`}
        >
          <p className="text-sm font-semibold text-[#1d1d1d]">Offline / personal payment</p>
          <p className="text-xs text-gray-500">
            Grant student dashboard + class access when payment was taken outside the website.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              placeholder="student@email.com"
              className="flex-1 rounded-xl border border-orange-100 px-3 py-2 text-sm outline-none focus:border-educture-orange"
            />
            <select
              value={grantClassId}
              onChange={(e) => setGrantClassId(e.target.value)}
              className="sm:w-64 rounded-xl border border-orange-100 px-3 py-2 text-sm outline-none bg-white"
            >
              <option value="">Match Full Stack by name</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                  {item.published ? '' : ' (draft)'}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={granting}
              className="rounded-full bg-educture-orange px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {granting ? 'Granting…' : 'Grant access'}
            </button>
          </div>
          {grantMessage && <p className="text-sm text-emerald-700">{grantMessage}</p>}
          {grantError && <p className="text-sm text-rose-700">{grantError}</p>}
        </form>

        <div className="flex items-center gap-2">
          <label className={`${dashboardCardBorder} border-orange-100 bg-white rounded-2xl px-4 py-3 flex items-center gap-3 flex-1`}>
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, class…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-orange-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className={`${dashboardCardBorder} border-orange-100 rounded-2xl bg-white p-6 text-sm text-gray-500`}>
            Loading enrollments…
          </div>
        )}
        {!loading && error && (
          <div className={`${dashboardCardBorder} border-rose-200 rounded-2xl bg-rose-50 p-6 text-sm text-rose-700`}>
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className={`${dashboardCardBorder} border-dashed border-orange-200 rounded-2xl bg-white p-8 text-center`}>
            <p className="text-sm text-gray-500">No class enrollments yet.</p>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((row) => (
              <article key={row.id} className={`${dashboardCardBorder} border-orange-100 rounded-2xl bg-white p-5 text-left`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-educture-orange">
                      {row.kind === 'free' ? 'Free course' : 'Live class'}
                    </p>
                    <h2 className="font-bold text-lg text-[#1d1d1d] mt-1">{row.fullName}</h2>
                    <p className="text-sm text-gray-600 mt-0.5 inline-flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-educture-orange" />
                      {row.classTitle}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase text-indigo-800">
                    {row.billingStatus || row.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                  {row.email && <a href={`mailto:${row.email}`} className="hover:text-educture-orange">{row.email}</a>}
                  {row.phone && <span>{row.phone}</span>}
                  {row.planTier && <span className="font-semibold text-gray-700">{row.planTier}</span>}
                  <span>Progress {row.progress}%</span>
                </div>
                {row.enrolledAt && (
                  <p className="mt-3 text-[10px] text-gray-400">
                    Enrolled {new Date(row.enrolledAt).toLocaleString('en-IN')}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
    </div>
  )
}

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, FileUp } from 'lucide-react'
import { StudentPageHeader } from '../components/layout/StudentLayout'
import { AppButton } from '../components/ui/AppButton'
import { useMentorContent } from '../context/MentorContentContext'
import { dashboardCardBorder, dashboardTint } from '../components/ui/dashboardCardStyles'

type Tab = 'due' | 'submitted'

export function StudentAssignmentsPage() {
  const { assignments, submitAssignment } = useMentorContent()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'submitted' ? 'submitted' : 'due'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const pending = assignments.filter((a) => a.status === 'pending')
  const submitted = assignments.filter((a) => a.status === 'submitted')

  const handleSubmit = (id: string) => {
    submitAssignment(id, note)
    setSubmittingId(null)
    setNote('')
    setTab('submitted')
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'due', label: 'Due', count: pending.length },
    { id: 'submitted', label: 'Submitted', count: submitted.length },
  ]

  return (
    <>
      <StudentPageHeader
        title="Assignments"
        subtitle={`${pending.length} due · ${submitted.length} submitted — submit work here and review what you already sent.`}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => {
            const tint = dashboardTint(t.id === 'due' ? 0 : 2)
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${dashboardCardBorder} ${
                  active
                    ? `${tint.bg} ${tint.border} text-[#1d1d1d]`
                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200'
                }`}
              >
                {t.label}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    active ? 'bg-educture-orange text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        {tab === 'due' && (
          <>
            {pending.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-12">
                Nothing due right now. Check <button type="button" className="text-educture-orange font-semibold" onClick={() => setTab('submitted')}>Submitted</button> for past work.
              </p>
            ) : (
              <div className="space-y-4">
                {pending.map((a, i) => {
                  const tint = dashboardTint(i)
                  return (
                    <article
                      key={a.id}
                      className={`${dashboardCardBorder} ${tint.bg} ${tint.border} flex flex-col sm:flex-row gap-4 p-4 sm:p-5 items-start sm:items-center card-lift text-left`}
                    >
                      <img src={a.img} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 border-2 border-white" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1d1d1d]">{a.title}</p>
                        <p className="text-sm text-educture-orange">{a.course}</p>
                        <p className="text-xs text-gray-600 mt-1">Due {a.due}</p>
                      </div>
                      {submittingId === a.id ? (
                        <div className="w-full sm:w-72 space-y-3">
                          <label className="text-xs font-semibold text-gray-600">Note for mentor (optional)</label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Link to file or short message…"
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 bg-white text-sm outline-none focus:border-educture-orange"
                          />
                          <div className="flex gap-2">
                            <AppButton size="sm" onClick={() => handleSubmit(a.id)}>Confirm submit</AppButton>
                            <AppButton size="sm" variant="outline" onClick={() => { setSubmittingId(null); setNote('') }}>
                              Cancel
                            </AppButton>
                          </div>
                        </div>
                      ) : (
                        <AppButton size="sm" onClick={() => setSubmittingId(a.id)}>
                          <FileUp className="w-4 h-4" /> Submit
                        </AppButton>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'submitted' && (
          <>
            {submitted.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-12">No submissions yet. Open Due tab to submit assignments.</p>
            ) : (
              <div className="space-y-4">
                {submitted.map((a, i) => {
                  const tint = dashboardTint(i + 1)
                  return (
                    <article
                      key={a.id}
                      className={`${dashboardCardBorder} ${tint.bg} ${tint.border} flex gap-4 p-4 sm:p-5 items-start text-left`}
                    >
                      <img src={a.img} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 border-2 border-white" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-[#1d1d1d]">{a.title}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border-2 border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Submitted
                          </span>
                        </div>
                        <p className="text-sm text-educture-orange">{a.course}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Submitted on {a.submittedAt ?? a.due.replace(/^Submitted · /, '')}
                        </p>
                        {a.studentNote && (
                          <p className="text-sm text-gray-700 mt-2 p-3 rounded-xl bg-white/70 border-2 border-white">
                            {a.studentNote}
                          </p>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}

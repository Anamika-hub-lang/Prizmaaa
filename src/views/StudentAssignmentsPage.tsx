import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, ExternalLink, FileUp, Link2, Paperclip, XCircle } from 'lucide-react'
import { StudentPageHeader } from '../components/layout/StudentLayout'
import { AppButton } from '../components/ui/AppButton'
import { useMentorContent } from '../context/MentorContentContext'
import { dashboardCardBorder, dashboardTint } from '../components/ui/dashboardCardStyles'
import { AssignmentReferenceImages } from '../components/assignments/AssignmentReferenceImages'
import { ReviewStatusBadge } from '../components/assignments/ReviewStatusBadge'
import { useStudentSubmissions } from '../hooks/useStudentSubmissions'
import {
  ASSIGNMENT_FILE_ACCEPT,
  ASSIGNMENT_FILE_MAX_MB,
  isAllowedAssignmentFile,
  isHttpUrl,
} from '../lib/studentAssignmentSubmitApi'
import { formatSessionLabel } from '../lib/sessionSchedule'
import type { StudentSubmissionReview } from '../lib/studentAssignmentReviewApi'
import type { MentorAssignment } from '../types/mentorContent'

type Tab = 'due' | 'submitted'

function SubmissionAttachment({
  assignment,
  mine,
}: {
  assignment: MentorAssignment
  mine?: StudentSubmissionReview
}) {
  const fileUrl = mine?.fileUrl ?? assignment.submissionFileUrl
  const fileName = mine?.fileName ?? assignment.submissionFileName
  const link = mine?.link ?? assignment.submissionLink
  if (!fileUrl && !link) return null
  return (
    <div className="flex flex-col gap-1">
      {fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange mt-2 hover:underline"
        >
          <Paperclip className="w-4 h-4" />
          {fileName || 'Open file'}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : null}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange mt-2 hover:underline break-all"
        >
          <Link2 className="w-4 h-4 shrink-0" />
          {link}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : null}
    </div>
  )
}

/** The mentor's decision on this student's work, with the note explaining a rejection. */
function MentorDecision({ mine }: { mine: StudentSubmissionReview }) {
  if (mine.reviewStatus === 'pending') return null
  const rejected = mine.reviewStatus === 'rejected'
  return (
    <div
      className={`mt-3 p-3 rounded-xl border-2 ${
        rejected ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
      }`}
    >
      <p
        className={`text-sm font-bold flex items-center gap-2 ${
          rejected ? 'text-rose-800' : 'text-emerald-800'
        }`}
      >
        {rejected ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        {rejected ? 'Mentor asked for changes' : 'Approved by your mentor'}
      </p>
      {mine.reviewNote ? (
        <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{mine.reviewNote}</p>
      ) : null}
      {mine.reviewedAt ? (
        <p className="text-xs text-gray-600 mt-2">
          Reviewed {formatSessionLabel(mine.reviewedAt)}
        </p>
      ) : null}
      {rejected ? (
        <p className="text-xs text-gray-600 mt-1">
          Fix it and submit again from the Due tab.
        </p>
      ) : null}
    </div>
  )
}

export function StudentAssignmentsPage() {
  const { assignments, submitAssignment } = useMentorContent()
  const { byAssignment, refresh: refreshSubmissions } = useStudentSubmissions()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'submitted' ? 'submitted' : 'due'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [submissionLink, setSubmissionLink] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // A record in `byAssignment` means this student personally submitted; the assignment-level
  // `status` is shared across the class, so it only decides the legacy case.
  const { pending, submitted } = useMemo(() => {
    const pendingList: MentorAssignment[] = []
    const submittedList: MentorAssignment[] = []
    for (const a of assignments) {
      if (byAssignment.has(a.id) || a.status === 'submitted') submittedList.push(a)
      else pendingList.push(a)
    }
    return { pending: pendingList, submitted: submittedList }
  }, [assignments, byAssignment])

  const resetForm = () => {
    setSubmittingId(null)
    setNote('')
    setSubmissionLink('')
    setFile(null)
    setFormError(null)
    setBusy(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (id: string) => {
    const link = submissionLink.trim()
    if (file) {
      if (!isAllowedAssignmentFile(file)) {
        setFormError('That file type is not allowed. Use a zip, PDF, image, Office file, or similar.')
        return
      }
      if (file.size > ASSIGNMENT_FILE_MAX_MB * 1024 * 1024) {
        setFormError(`File must be ${ASSIGNMENT_FILE_MAX_MB} MB or smaller.`)
        return
      }
    }
    if (link && !isHttpUrl(link)) {
      setFormError('Enter a valid http or https link, or leave it blank.')
      return
    }
    if (!file && !link && !note.trim()) {
      setFormError('Add a file, a link, or a note — whichever you want to send.')
      return
    }

    setFormError(null)
    setBusy(true)
    try {
      await submitAssignment(id, {
        note,
        file,
        link: link || undefined,
      })
      resetForm()
      await refreshSubmissions()
      setTab('submitted')
    } catch (e) {
      setBusy(false)
      setFormError(e instanceof Error ? e.message : 'Could not submit assignment')
    }
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
                Nothing due right now. Check{' '}
                <button type="button" className="text-educture-orange font-semibold" onClick={() => setTab('submitted')}>
                  Submitted
                </button>{' '}
                for past work.
              </p>
            ) : (
              <div className="space-y-4">
                {pending.map((a, i) => {
                  const tint = dashboardTint(i)
                  return (
                    <article
                      key={a.id}
                      className={`${dashboardCardBorder} ${tint.bg} ${tint.border} flex flex-col sm:flex-row gap-4 p-4 sm:p-5 items-start card-lift text-left`}
                    >
                      {a.img ? (
                        <img src={a.img} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 border-2 border-white" />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1d1d1d]">{a.title}</p>
                        <p className="text-sm text-educture-orange">{a.course}</p>
                        <p className="text-xs text-gray-600 mt-1">Due {formatSessionLabel(a.due)}</p>
                        {a.description ? (
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.description}</p>
                        ) : null}
                        <AssignmentReferenceImages urls={a.referenceImages ?? []} />
                        {a.pdfUrl ? (
                          <a
                            href={a.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange mt-2 hover:underline"
                          >
                            {a.pdfName || 'Open assignment PDF'}
                          </a>
                        ) : null}
                      </div>
                      {submittingId === a.id ? (
                        <div className="w-full sm:w-80 space-y-3">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">File (optional)</label>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept={ASSIGNMENT_FILE_ACCEPT}
                              className="sr-only"
                              onChange={(e) => {
                                const next = e.target.files?.[0] ?? null
                                setFile(next)
                                setFormError(null)
                              }}
                            />
                            <AppButton
                              size="sm"
                              variant="outlineOrange"
                              className="w-full"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <FileUp className="w-4 h-4" />
                              {file ? 'Change file' : 'Choose file'}
                            </AppButton>
                            {file ? (
                              <p className="text-xs text-gray-700 truncate" title={file.name}>
                                {file.name}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500">
                                Zip, PDF, image, Word, or other common files — {ASSIGNMENT_FILE_MAX_MB} MB max
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Link (optional)</label>
                            <input
                              type="url"
                              value={submissionLink}
                              onChange={(e) => {
                                setSubmissionLink(e.target.value)
                                setFormError(null)
                              }}
                              placeholder="https://"
                              className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 bg-white text-sm outline-none focus:border-educture-orange"
                            />
                          </div>
                          <label className="text-xs font-semibold text-gray-600">Note (optional)</label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Short message…"
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 bg-white text-sm outline-none focus:border-educture-orange"
                          />
                          {formError && <p className="text-xs text-red-600">{formError}</p>}
                          <div className="flex gap-2">
                            <AppButton
                              size="sm"
                              className={busy ? 'opacity-70 pointer-events-none' : ''}
                              onClick={() => {
                                if (!busy) void handleSubmit(a.id)
                              }}
                            >
                              {busy ? 'Submitting…' : 'Confirm submit'}
                            </AppButton>
                            <AppButton size="sm" variant="outline" onClick={resetForm}>
                              Cancel
                            </AppButton>
                          </div>
                        </div>
                      ) : (
                        <AppButton
                          size="sm"
                          onClick={() => {
                            resetForm()
                            setSubmittingId(a.id)
                          }}
                        >
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
                  const mine = byAssignment.get(a.id)
                  const submittedLabel = mine?.submittedAt
                    ? formatSessionLabel(mine.submittedAt)
                    : (a.submittedAt ?? formatSessionLabel(a.due))
                  const ownNote = mine?.note || a.studentNote
                  return (
                    <article
                      key={a.id}
                      className={`${dashboardCardBorder} ${tint.bg} ${tint.border} flex gap-4 p-4 sm:p-5 items-start text-left`}
                    >
                      <img src={a.img} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 border-2 border-white" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-[#1d1d1d]">{a.title}</p>
                          {mine ? (
                            <ReviewStatusBadge status={mine.reviewStatus} />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border-2 border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Submitted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-educture-orange">{a.course}</p>
                        <p className="text-xs text-gray-600 mt-1">Submitted on {submittedLabel}</p>
                        {a.description ? (
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.description}</p>
                        ) : null}
                        <AssignmentReferenceImages urls={a.referenceImages ?? []} />
                        <SubmissionAttachment assignment={a} mine={mine} />
                        {ownNote && (
                          <p className="text-sm text-gray-700 mt-2 p-3 rounded-xl bg-white/70 border-2 border-white">
                            {ownNote}
                          </p>
                        )}
                        {mine ? <MentorDecision mine={mine} /> : null}
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

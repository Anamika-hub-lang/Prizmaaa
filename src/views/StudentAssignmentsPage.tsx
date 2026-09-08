import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, ExternalLink, FileUp, Link2, Paperclip } from 'lucide-react'
import { StudentPageHeader } from '../components/layout/StudentLayout'
import { AppButton } from '../components/ui/AppButton'
import { useMentorContent } from '../context/MentorContentContext'
import { dashboardCardBorder, dashboardTint } from '../components/ui/dashboardCardStyles'
import { AssignmentReferenceImages } from '../components/assignments/AssignmentReferenceImages'
import {
  ASSIGNMENT_FILE_ACCEPT,
  isAllowedAssignmentFile,
  isHttpUrl,
} from '../lib/studentAssignmentSubmitApi'
import { formatSessionLabel } from '../lib/sessionSchedule'
import type { MentorAssignment } from '../types/mentorContent'

type Tab = 'due' | 'submitted'
type SubmitMode = 'file' | 'link'

function SubmissionAttachment({ assignment }: { assignment: MentorAssignment }) {
  if (assignment.submissionType === 'file' && assignment.submissionFileUrl) {
    return (
      <a
        href={assignment.submissionFileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange mt-2 hover:underline"
      >
        <Paperclip className="w-4 h-4" />
        {assignment.submissionFileName || 'Open file'}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    )
  }
  if (assignment.submissionType === 'link' && assignment.submissionLink) {
    return (
      <a
        href={assignment.submissionLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange mt-2 hover:underline break-all"
      >
        <Link2 className="w-4 h-4 shrink-0" />
        {assignment.submissionLink}
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
      </a>
    )
  }
  return null
}

export function StudentAssignmentsPage() {
  const { assignments, submitAssignment } = useMentorContent()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'submitted' ? 'submitted' : 'due'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [submitMode, setSubmitMode] = useState<SubmitMode>('file')
  const [note, setNote] = useState('')
  const [submissionLink, setSubmissionLink] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pending = assignments.filter((a) => a.status === 'pending')
  const submitted = assignments.filter((a) => a.status === 'submitted')

  const resetForm = () => {
    setSubmittingId(null)
    setSubmitMode('file')
    setNote('')
    setSubmissionLink('')
    setFile(null)
    setFormError(null)
    setBusy(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (id: string) => {
    if (submitMode === 'file') {
      if (!file) {
        setFormError('Choose a file to upload.')
        return
      }
      if (!isAllowedAssignmentFile(file)) {
        setFormError('Upload a PDF, PNG, JPEG, WebP, DOC, or DOCX file.')
        return
      }
      if (file.size > 8 * 1024 * 1024) {
        setFormError('File must be 8 MB or smaller.')
        return
      }
    } else if (!isHttpUrl(submissionLink)) {
      setFormError('Enter a valid http or https link.')
      return
    }

    setFormError(null)
    setBusy(true)
    try {
      await submitAssignment(id, {
        note,
        file: submitMode === 'file' ? file : null,
        link: submitMode === 'link' ? submissionLink.trim() : undefined,
      })
      resetForm()
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

  const modeTabs: { id: SubmitMode; label: string }[] = [
    { id: 'file', label: 'File' },
    { id: 'link', label: 'Link' },
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
                          <div className="flex gap-1 p-1 rounded-full bg-white/80 border-2 border-white">
                            {modeTabs.map((mode) => {
                              const active = submitMode === mode.id
                              return (
                                <button
                                  key={mode.id}
                                  type="button"
                                  onClick={() => {
                                    setSubmitMode(mode.id)
                                    setFormError(null)
                                  }}
                                  className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    active
                                      ? 'bg-educture-orange text-white'
                                      : 'text-gray-600 hover:text-[#1d1d1d]'
                                  }`}
                                >
                                  {mode.label}
                                </button>
                              )
                            })}
                          </div>

                          {submitMode === 'file' ? (
                            <div className="space-y-2">
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
                                <p className="text-xs text-gray-500">PDF, image, or Word — 8 MB max</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-600">Submission link</label>
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
                          )}

                          <label className="text-xs font-semibold text-gray-600">Note for mentor (optional)</label>
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
                          Submitted on {a.submittedAt ?? formatSessionLabel(a.due)}
                        </p>
                        {a.description ? (
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.description}</p>
                        ) : null}
                        <AssignmentReferenceImages urls={a.referenceImages ?? []} />
                        <SubmissionAttachment assignment={a} />
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

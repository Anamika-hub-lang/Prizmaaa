'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import {
  CheckCircle2,
  ChevronLeft,
  Download,
  ExternalLink,
  FileText,
  Link2,
  Paperclip,
  User,
  XCircle,
} from 'lucide-react'
import { useMentorContent } from '../../context/MentorContentContext'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { EmptyState } from '../../components/ui/StatusBadge'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'
import { ReviewStatusBadge } from '../../components/assignments/ReviewStatusBadge'
import { useAssignmentSubmissions } from '../../hooks/useAssignmentSubmissions'
import { reviewAssignmentSubmission } from '../../lib/mentorAssignmentAssetsApi'
import { submissionFileKind } from '../../lib/submissionFileKind'
import { formatSessionLabel } from '../../lib/sessionSchedule'
import type { AssignmentStudentSubmission } from '../../types/mentorContent'

const linkClass =
  'inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline'
/** Matches AppButton's outlineOrange variant — used for real anchors to external storage URLs. */
const anchorButtonClass =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-2.5 text-sm bg-white text-educture-orange border border-educture-orange hover:bg-educture-cream'

function SubmittedWork({ submission }: { submission: AssignmentStudentSubmission }) {
  const kind = submissionFileKind(submission)
  const fileUrl = submission.fileUrl ?? ''
  const fileName = submission.fileName || 'submission'

  switch (kind) {
    case 'pdf':
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">{fileName}</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={anchorButtonClass}>
            <FileText className="w-4 h-4" />
            Open PDF in a new tab
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )
    case 'image':
      return (
        <div className="space-y-2">
          <img
            src={fileUrl}
            alt={`${submission.studentName}'s submission`}
            className="max-h-[520px] w-auto max-w-full rounded-xl border-2 border-white"
          />
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <ExternalLink className="w-3.5 h-3.5" />
            Open full size
          </a>
        </div>
      )
    case 'archive':
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">{fileName}</p>
          <a href={fileUrl} download={fileName} className={anchorButtonClass}>
            <Download className="w-4 h-4" />
            Download archive
          </a>
        </div>
      )
    case 'link':
      return submission.link ? (
        <a
          href={submission.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} break-all`}
        >
          <Link2 className="w-4 h-4 shrink-0" />
          {submission.link}
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      ) : (
        <p className="text-sm text-gray-500">The student did not include a link.</p>
      )
    case 'other':
      return fileUrl ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">{fileName}</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <Paperclip className="w-4 h-4" />
            Open file
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No file or link — the student only left a note.
        </p>
      )
    default: {
      const exhaustive: never = kind
      return exhaustive
    }
  }
}

export function MentorSubmissionReviewPage() {
  const { assignmentId, submissionId } = useParams<{
    assignmentId: string
    submissionId: string
  }>()
  const { getToken } = useAuth()
  const { myAssignments } = useMentorContent()
  const { submissions, loading, error, applyReview } = useAssignmentSubmissions(assignmentId)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState<'approved' | 'rejected' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const assignment = myAssignments.find((a) => a.id === assignmentId) ?? null
  const submission = submissions.find((s) => s.id === submissionId) ?? null
  const backTo = `/teacher/assignments/${assignmentId ?? ''}`

  const decide = async (decision: 'approved' | 'rejected') => {
    if (!assignmentId || !submissionId) return
    const trimmed = note.trim()
    if (decision === 'rejected' && !trimmed) {
      setFormError('Add a note so the student knows what to fix.')
      return
    }
    setFormError(null)
    setSaving(decision)
    try {
      const updated = await reviewAssignmentSubmission(getToken, {
        assignmentId,
        submissionId,
        decision,
        note: trimmed,
      })
      applyReview(updated)
      setNote('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save the review')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <>
        <MentorPageHeader title="Student work" />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-gray-500 text-center py-8">Loading submission…</p>
        </main>
      </>
    )
  }

  if (error || !submission) {
    return (
      <>
        <MentorPageHeader title="Student work" />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <EmptyState
            title={error ? 'Could not load this submission' : 'Submission not found'}
            description={error ?? 'It may have been withdrawn, or the link is out of date.'}
            action={<AppButton to={backTo}>Back to assignment</AppButton>}
          />
        </main>
      </>
    )
  }

  const reviewed = submission.reviewStatus !== 'pending'

  return (
    <>
      <MentorPageHeader
        title={submission.studentName}
        subtitle={assignment ? `${assignment.title} · ${assignment.course}` : undefined}
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left space-y-5">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-sm font-semibold text-educture-orange"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to assignment
        </Link>

        <div
          className={`${dashboardCardBorder} ${dashboardTint(0).bg} ${dashboardTint(0).border} rounded-2xl p-5 space-y-3`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-[#1d1d1d] flex items-center gap-2">
              <User className="w-4 h-4" />
              {submission.studentName}
            </p>
            <ReviewStatusBadge status={submission.reviewStatus} />
          </div>
          <p className="text-xs text-gray-600">
            Submitted {formatSessionLabel(submission.submittedAt) || '—'}
          </p>
          {submission.note ? (
            <p className="text-sm text-gray-700 p-3 rounded-lg bg-white/80 border-2 border-white">
              <span className="font-semibold">Student note:</span> {submission.note}
            </p>
          ) : null}
        </div>

        <div
          className={`${dashboardCardBorder} ${dashboardTint(1).bg} ${dashboardTint(1).border} rounded-2xl p-5 space-y-3`}
        >
          <p className="font-bold">Submitted work</p>
          <SubmittedWork submission={submission} />
        </div>

        <div
          className={`${dashboardCardBorder} ${dashboardTint(2).bg} ${dashboardTint(2).border} rounded-2xl p-5 space-y-3`}
        >
          <p className="font-bold">Your review</p>
          {reviewed ? (
            <div className="p-3 rounded-lg bg-white/80 border-2 border-white space-y-2">
              <p className="text-sm font-semibold text-[#1d1d1d] flex items-center gap-2">
                {submission.reviewStatus === 'approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                {submission.reviewStatus === 'approved' ? 'Approved' : 'Rejected'}
                {submission.reviewedAt
                  ? ` on ${formatSessionLabel(submission.reviewedAt)}`
                  : ''}
              </p>
              {submission.reviewNote ? (
                <p className="text-sm text-gray-700">{submission.reviewNote}</p>
              ) : null}
              <p className="text-xs text-gray-500">
                The student can see this on their assignments page. Submit again below to change it.
              </p>
            </div>
          ) : null}

          <label className="block text-xs font-semibold text-gray-600">
            Note for the student{' '}
            <span className="font-normal text-gray-500">(required when rejecting)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What was good, or what needs fixing?"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white/80 text-sm outline-none focus:border-educture-orange resize-y"
            />
          </label>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex flex-wrap gap-2">
            <AppButton
              onClick={() => {
                void decide('approved')
              }}
              className={saving ? 'opacity-70 pointer-events-none' : ''}
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving === 'approved' ? 'Approving…' : 'Approve'}
            </AppButton>
            <AppButton
              variant="outline"
              onClick={() => {
                void decide('rejected')
              }}
              className={`border-rose-300 text-rose-700 hover:bg-rose-50 ${
                saving ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              <XCircle className="w-4 h-4" />
              {saving === 'rejected' ? 'Rejecting…' : 'Reject'}
            </AppButton>
          </div>
        </div>
      </main>
    </>
  )
}

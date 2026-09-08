'use client'

import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Pencil,
  Trash2,
  User,
  XCircle,
} from 'lucide-react'
import { useMentorContent } from '../../context/MentorContentContext'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { AppModal } from '../../components/ui/AppModal'
import { EmptyState, StatusBadge } from '../../components/ui/StatusBadge'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'
import { AssignmentReferenceImages } from '../../components/assignments/AssignmentReferenceImages'
import { ReviewStatusBadge } from '../../components/assignments/ReviewStatusBadge'
import { AssignmentFormModal } from '../../components/mentor/AssignmentFormModal'
import { useAssignmentSubmissions } from '../../hooks/useAssignmentSubmissions'
import { isLegacySubmissionId } from '../../lib/mentorAssignmentAssetsApi'
import { formatSessionLabel } from '../../lib/sessionSchedule'

function StatCard({ label, value, hint, tint }: { label: string; value: string; hint?: string; tint: number }) {
  const t = dashboardTint(tint)
  return (
    <div className={`${dashboardCardBorder} ${t.bg} ${t.border} rounded-2xl p-4`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</p>
      <p className="font-display text-2xl text-[#1d1d1d] mt-1">{value}</p>
      {hint ? <p className="text-xs text-gray-600 mt-1">{hint}</p> : null}
    </div>
  )
}

export function MentorAssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()
  const { myAssignments, removeAssignment, loading: contentLoading } = useMentorContent()
  const { submissions, enrolledCount, loading, error } = useAssignmentSubmissions(assignmentId)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const assignment = myAssignments.find((a) => a.id === assignmentId) ?? null

  const stats = useMemo(() => {
    const approved = submissions.filter((s) => s.reviewStatus === 'approved').length
    const rejected = submissions.filter((s) => s.reviewStatus === 'rejected').length
    const awaiting = submissions.filter((s) => s.reviewStatus === 'pending').length
    const rate = enrolledCount > 0 ? Math.round((submissions.length / enrolledCount) * 100) : null
    return { approved, rejected, awaiting, rate }
  }, [submissions, enrolledCount])

  const handleDelete = async () => {
    if (!assignmentId) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await removeAssignment(assignmentId)
      navigate('/teacher/assignments')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete assignment')
      setDeleting(false)
    }
  }

  if (!assignment) {
    return (
      <>
        <MentorPageHeader title="Assignment" />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {contentLoading ? (
            <p className="text-sm text-gray-500 text-center py-8">Loading assignment…</p>
          ) : (
            <EmptyState
              title="Assignment not found"
              description="It may have been deleted, or it belongs to another mentor."
              action={<AppButton to="/teacher/assignments">Back to assignments</AppButton>}
            />
          )}
        </main>
      </>
    )
  }

  return (
    <>
      <MentorPageHeader title={assignment.title} subtitle={assignment.course} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/teacher/assignments"
            className="inline-flex items-center gap-1 text-sm font-semibold text-educture-orange"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to assignments
          </Link>
          <div className="flex flex-wrap gap-2">
            <AppButton variant="outlineOrange" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4" />
              Edit
            </AppButton>
            <AppButton variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </AppButton>
          </div>
        </div>

        <div
          className={`${dashboardCardBorder} ${dashboardTint(0).bg} ${dashboardTint(0).border} rounded-2xl p-5 space-y-3`}
        >
          <p className="text-xs text-gray-600">Due {formatSessionLabel(assignment.due)}</p>
          {assignment.description ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
          ) : null}
          <AssignmentReferenceImages urls={assignment.referenceImages ?? []} />
          {assignment.pdfUrl ? (
            <a
              href={assignment.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <FileText className="w-4 h-4" />
              {assignment.pdfName || 'Open assignment PDF'}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Submitted"
            value={String(submissions.length)}
            hint={enrolledCount > 0 ? `of ${enrolledCount} enrolled` : 'no enrolled students yet'}
            tint={1}
          />
          <StatCard
            label="Completion"
            value={stats.rate === null ? '—' : `${stats.rate}%`}
            hint={stats.rate === null ? 'needs an enrolled class' : undefined}
            tint={2}
          />
          <StatCard label="Approved" value={String(stats.approved)} tint={3}
            hint={stats.rejected > 0 ? `${stats.rejected} rejected` : undefined}
          />
          <StatCard label="Awaiting review" value={String(stats.awaiting)} tint={4} />
        </div>

        <div
          className={`${dashboardCardBorder} ${dashboardTint(2).bg} ${dashboardTint(2).border} rounded-2xl p-5`}
        >
          <p className="font-bold mb-3">Student submissions</p>
          {loading ? (
            <p className="text-sm text-gray-500">Loading submissions…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-gray-500">No students have submitted work yet.</p>
          ) : (
            <ul className="space-y-3">
              {submissions.map((item) => {
                const legacy = isLegacySubmissionId(item.id)
                const inner = (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1d1d1d] flex items-center gap-2">
                        <User className="w-4 h-4 shrink-0" />
                        {item.studentName}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Submitted {formatSessionLabel(item.submittedAt) || '—'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {legacy ? (
                          <StatusBadge label="Older submission" tone="neutral" />
                        ) : (
                          <ReviewStatusBadge status={item.reviewStatus} />
                        )}
                        {item.reviewStatus === 'approved' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : item.reviewStatus === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        ) : null}
                      </div>
                      {legacy ? (
                        <p className="text-xs text-gray-500 mt-2">
                          Stored before reviews existed — ask the student to resubmit to review it.
                        </p>
                      ) : null}
                    </div>
                    {legacy ? null : <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />}
                  </>
                )

                const shell = 'flex gap-3 items-center p-4 rounded-xl bg-white/80 border-2 border-white'
                return (
                  <li key={item.id}>
                    {legacy ? (
                      <div className={shell}>{inner}</div>
                    ) : (
                      <Link
                        to={`/teacher/assignments/${assignment.id}/${item.id}`}
                        className={`${shell} hover:border-orange-200 transition-colors`}
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>

      {editing && (
        <AssignmentFormModal
          mode="edit"
          assignment={assignment}
          onClose={() => setEditing(false)}
        />
      )}

      {confirmDelete && (
        <AppModal
          title="Delete this assignment?"
          subtitle="Students lose access to the brief and their submissions are removed."
          onClose={() => setConfirmDelete(false)}
        >
          <p className="text-sm text-gray-700">
            <strong>{assignment.title}</strong> will be deleted for every student in{' '}
            {assignment.course}. This cannot be undone.
          </p>
          {deleteError && <p className="text-sm text-red-600 mt-3">{deleteError}</p>}
          <div className="flex flex-wrap gap-2 mt-5">
            <AppButton
              variant="outline"
              onClick={() => {
                void handleDelete()
              }}
              className={`border-rose-300 text-rose-700 hover:bg-rose-50 ${
                deleting ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting…' : 'Delete assignment'}
            </AppButton>
            <AppButton variant="outline" onClick={() => setConfirmDelete(false)}>
              Keep it
            </AppButton>
          </div>
        </AppModal>
      )}
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronLeft, Clock, ExternalLink, FileText, ImagePlus, Link2, Paperclip, User, X } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useMentorContent } from '../../context/MentorContentContext'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'
import { AssignmentReferenceImages } from '../../components/assignments/AssignmentReferenceImages'
import { createClassNotification } from '../../lib/classNotificationsApi'
import {
  ASSIGNMENT_IMAGE_ACCEPT,
  DEFAULT_ASSIGNMENT_THUMBNAIL,
  isAllowedAssignmentImage,
  MAX_ASSIGNMENT_IMAGE_BYTES,
  MAX_ASSIGNMENT_REFERENCE_IMAGES,
  uploadMentorAssignmentReferenceImages,
  fetchAssignmentSubmissions,
} from '../../lib/mentorAssignmentAssetsApi'
import { formatSessionLabel } from '../../lib/sessionSchedule'

type MentorTab = 'all' | 'awaiting' | 'submitted'

const fieldClass =
  'w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white/80 text-sm outline-none focus:border-educture-orange'

function toDatetimeLocalValue(value: string): string {
  if (!value.trim()) return ''
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return ''
  const d = new Date(parsed)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function dueToIso(value: string): string | null {
  if (!value.trim()) return null
  const when = new Date(value)
  if (Number.isNaN(when.getTime())) return null
  return when.toISOString()
}

export function MentorAssignmentsPage() {
  const { myAssignments, myClasses, addAssignment, updateAssignment, usingLocalData, loading, syncError } =
    useMentorContent()
  const { getToken } = useAuth()
  const [tab, setTab] = useState<MentorTab>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCourse, setEditCourse] = useState('')
  const [editDue, setEditDue] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [title, setTitle] = useState('')
  const [classId, setClassId] = useState('')
  const [due, setDue] = useState('')
  const [description, setDescription] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [notifyError, setNotifyError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<
    Awaited<ReturnType<typeof fetchAssignmentSubmissions>>
  >([])
  const [submissionsError, setSubmissionsError] = useState<string | null>(null)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const selected = myAssignments.find((a) => a.id === selectedId) ?? null

  useEffect(() => {
    if (!selectedId) {
      setSubmissions([])
      setSubmissionsError(null)
      return
    }
    let cancelled = false
    setSubmissionsLoading(true)
    setSubmissionsError(null)
    void fetchAssignmentSubmissions(getToken, selectedId)
      .then((rows) => {
        if (!cancelled) setSubmissions(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setSubmissions([])
          setSubmissionsError(err instanceof Error ? err.message : 'Could not load submissions')
        }
      })
      .finally(() => {
        if (!cancelled) setSubmissionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, getToken])

  const awaiting = myAssignments.filter((a) => a.status === 'pending')
  const submitted = myAssignments.filter((a) => a.status === 'submitted')

  const visible = tab === 'all' ? myAssignments : tab === 'awaiting' ? awaiting : submitted

  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews(urls)
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [imageFiles])

  const resetCreateForm = () => {
    setTitle('')
    setDue('')
    setDescription('')
    setImageFiles([])
    setNotifyError(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const appendImages = (list: FileList | null) => {
    if (!list) return
    const next = [...imageFiles]
    for (const file of Array.from(list)) {
      if (next.length >= MAX_ASSIGNMENT_REFERENCE_IMAGES) {
        setNotifyError(`Upload up to ${MAX_ASSIGNMENT_REFERENCE_IMAGES} reference images.`)
        break
      }
      if (!isAllowedAssignmentImage(file)) {
        setNotifyError('Reference images must be PNG, JPEG, or WebP.')
        continue
      }
      if (file.size > MAX_ASSIGNMENT_IMAGE_BYTES) {
        setNotifyError('Each image must be 8 MB or smaller.')
        continue
      }
      next.push(file)
    }
    setImageFiles(next)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const cls = myClasses.find((c) => c.id === classId)
    if (!cls) {
      setNotifyError('Choose a class so enrolled students get notified.')
      return
    }
    const dueIso = dueToIso(due)
    if (!dueIso) {
      setNotifyError('Pick a valid deadline.')
      return
    }
    const brief = description.trim()
    if (!brief) {
      setNotifyError('Add a task description.')
      return
    }

    setNotifyError(null)
    setPublishing(true)
    const id = `asg-${Date.now()}`
    let referenceImages: string[] = []
    try {
      if (imageFiles.length > 0) {
        if (usingLocalData) {
          referenceImages = imageFiles.map((file) => URL.createObjectURL(file))
        } else {
          referenceImages = await uploadMentorAssignmentReferenceImages(getToken, {
            assignmentId: id,
            files: imageFiles,
          })
        }
      }
      const dueLabel = formatSessionLabel(dueIso)
      await addAssignment({
        id,
        title: title.trim(),
        course: cls.title,
        due: dueIso,
        img: referenceImages[0] ?? DEFAULT_ASSIGNMENT_THUMBNAIL,
        description: brief,
        referenceImages,
        classId: cls.id,
      })
      void createClassNotification(getToken, {
        classId: cls.id,
        type: 'assignment',
        title: `New assignment: ${title.trim()}`,
        body: `Due ${dueLabel}${brief ? ` — ${brief.slice(0, 120)}` : ''}`,
        linkPath: '/student/assignments',
      }).catch((err) => {
        setNotifyError(err instanceof Error ? err.message : 'Assignment saved, but notify failed')
      })
      resetCreateForm()
    } catch (err) {
      setNotifyError(err instanceof Error ? err.message : 'Could not publish assignment')
    } finally {
      setPublishing(false)
    }
  }

  const tabs: { id: MentorTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: myAssignments.length },
    { id: 'awaiting', label: 'Awaiting submit', count: awaiting.length },
    { id: 'submitted', label: 'Student submitted', count: submitted.length },
  ]

  return (
    <>
      <MentorPageHeader
        title="Assignments"
        subtitle="Publish a brief, then click an assignment to review student uploads."
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left">
        {syncError && (
          <p className="text-sm text-red-600 mb-4">{syncError}</p>
        )}
        {selected ? (
          <div className="space-y-4">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-educture-orange"
              onClick={() => setSelectedId(null)}
            >
              <ChevronLeft className="w-4 h-4" />
              Back to assignments
            </button>
            <div className={`${dashboardCardBorder} ${dashboardTint(0).bg} ${dashboardTint(0).border} rounded-2xl p-5 space-y-3`}>
              <p className="font-bold text-lg">{selected.title}</p>
              <p className="text-sm text-educture-orange">{selected.course}</p>
              <p className="text-xs text-gray-600">Due {formatSessionLabel(selected.due)}</p>
              {selected.description ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.description}</p>
              ) : null}
              <AssignmentReferenceImages urls={selected.referenceImages ?? []} />
              {selected.pdfUrl ? (
                <a
                  href={selected.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  {selected.pdfName || 'Open assignment PDF'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>
            <div className={`${dashboardCardBorder} ${dashboardTint(2).bg} ${dashboardTint(2).border} rounded-2xl p-5`}>
              <p className="font-bold mb-3">Student submissions</p>
              {submissionsLoading ? (
                <p className="text-sm text-gray-500">Loading submissions…</p>
              ) : submissionsError ? (
                <p className="text-sm text-red-600">{submissionsError}</p>
              ) : submissions.length === 0 ? (
                <p className="text-sm text-gray-500">No students have submitted work yet.</p>
              ) : (
                <ul className="space-y-3">
                  {submissions.map((item) => (
                    <li
                      key={item.clerkId}
                      className="p-4 rounded-xl bg-white/80 border-2 border-white space-y-2"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {item.studentName}
                      </p>
                      <p className="text-sm text-gray-800">
                        Submitted on <strong>{item.submittedAt || '—'}</strong>
                      </p>
                      {item.note ? (
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Note:</span> {item.note}
                        </p>
                      ) : null}
                      {item.type === 'file' && item.fileUrl ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
                        >
                          <Paperclip className="w-4 h-4" />
                          Open file{item.fileName ? ` · ${item.fileName}` : ''}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : null}
                      {item.type === 'link' && item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline break-all"
                        >
                          <Link2 className="w-4 h-4 shrink-0" />
                          {item.link}
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <>
        {submitted.length > 0 && (
          <div className={`${dashboardCardBorder} ${dashboardTint(2).bg} ${dashboardTint(2).border} rounded-2xl p-5 mb-6`}>
            <p className="font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {submitted.length} assignment(s) submitted by students
            </p>
            <p className="text-sm text-gray-700 mt-2">
            Open an assignment to review each student’s file or link.
          </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleAdd(e)
          }}
          className={`${dashboardCardBorder} ${dashboardTint(0).bg} ${dashboardTint(0).border} rounded-2xl p-6 mb-8 space-y-4`}
        >
          <p className="font-bold">Create assignment</p>
          <label className="block text-xs font-semibold text-gray-600">
            Title
            <input
              placeholder="Assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`${fieldClass} mt-1.5`}
            />
          </label>
          <label className="block text-xs font-semibold text-gray-600">
            Class
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              className={`${fieldClass} mt-1.5`}
            >
              <option value="">Select class</option>
              {myClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-gray-600">
            Task description
            <textarea
              placeholder="What should students do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={`${fieldClass} mt-1.5 resize-y min-h-[96px]`}
            />
          </label>
          <label className="block text-xs font-semibold text-gray-600">
            Deadline
            <input
              type="datetime-local"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              required
              className={`${fieldClass} mt-1.5`}
            />
          </label>
          <div>
            <p className="text-xs font-semibold text-gray-600">Reference images (optional)</p>
            <input
              ref={imageInputRef}
              type="file"
              accept={ASSIGNMENT_IMAGE_ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => appendImages(e.target.files)}
            />
            <div className="mt-1.5 flex flex-wrap gap-2">
              {imagePreviews.map((src, index) => (
                <div key={`${imageFiles[index]?.name ?? src}-${index}`} className="relative">
                  <img src={src} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-white" />
                  <button
                    type="button"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                    onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imageFiles.length < MAX_ASSIGNMENT_REFERENCE_IMAGES && (
                <AppButton
                  type="button"
                  size="sm"
                  variant="outlineOrange"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImagePlus className="w-4 h-4" />
                  {imageFiles.length === 0 ? 'Add images' : 'Add more'}
                </AppButton>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPEG, or WebP — up to {MAX_ASSIGNMENT_REFERENCE_IMAGES} images, 8 MB each.
            </p>
          </div>
          {notifyError && <p className="text-sm text-red-600">{notifyError}</p>}
          <AppButton type="submit" className={publishing ? 'opacity-70 pointer-events-none' : ''}>
            {publishing ? 'Publishing…' : 'Publish to students'}
          </AppButton>
        </form>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => {
            const tint = dashboardTint(t.id === 'submitted' ? 2 : t.id === 'awaiting' ? 4 : 1)
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${dashboardCardBorder} ${
                  active ? `${tint.bg} ${tint.border} text-[#1d1d1d]` : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {t.label}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 border-2 border-white font-bold">
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        <ul className="space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500 py-8 text-center">Loading assignments…</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No assignments in this view.</p>
          ) : (
            visible.map((a, i) => {
              const tint = dashboardTint(i + 1)
              const isSubmitted = a.status === 'submitted'
              return (
                <li
                  key={a.id}
                  className={`flex gap-4 items-start ${dashboardCardBorder} ${tint.bg} ${tint.border} rounded-2xl p-4 sm:p-5`}
                >
                  {a.img ? (
                    <img src={a.img} alt="" className="w-16 h-16 rounded-xl object-cover hidden sm:block border-2 border-white" />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{a.title}</p>
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border-2 border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Student submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border-2 border-amber-200">
                          <Clock className="w-3 h-3" /> Not submitted yet
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-educture-orange">{a.course}</p>
                    {!isSubmitted && editingId !== a.id && (
                      <p className="text-xs text-gray-600 mt-1">Due {formatSessionLabel(a.due)}</p>
                    )}
                    {editingId !== a.id && a.description ? (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.description}</p>
                    ) : null}
                    {editingId !== a.id ? <AssignmentReferenceImages urls={a.referenceImages ?? []} /> : null}
                    {editingId !== a.id && a.pdfUrl ? (
                      <a
                        href={a.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange mt-2 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        {a.pdfName || 'Open assignment PDF'}
                      </a>
                    ) : null}
                    {editingId !== a.id && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-educture-orange mt-2 hover:underline"
                        onClick={() => setSelectedId(a.id)}
                      >
                        View student work
                      </button>
                    )}
                    {editingId === a.id && (
                      <div className="mt-3 space-y-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                        />
                        <input
                          value={editCourse}
                          onChange={(e) => setEditCourse(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border text-sm resize-y"
                        />
                        <input
                          type="datetime-local"
                          value={editDue}
                          onChange={(e) => setEditDue(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                        />
                        <button
                          type="button"
                          className="text-sm font-semibold text-educture-orange"
                          onClick={() => {
                            const nextDue = dueToIso(editDue) ?? editDue
                            updateAssignment(a.id, {
                              title: editTitle,
                              course: editCourse,
                              due: nextDue,
                              description: editDescription.trim(),
                            })
                            setEditingId(null)
                          }}
                        >
                          Save edits
                        </button>
                      </div>
                    )}
                    {!isSubmitted && editingId !== a.id && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-gray-600 mt-2 hover:text-educture-orange"
                        onClick={() => {
                          setEditingId(a.id)
                          setEditTitle(a.title)
                          setEditCourse(a.course)
                          setEditDue(toDatetimeLocalValue(a.due))
                          setEditDescription(a.description ?? '')
                        }}
                      >
                        Edit assignment
                      </button>
                    )}
                    {isSubmitted && (
                      <div className={`mt-3 p-4 rounded-xl ${dashboardCardBorder} border-emerald-200 bg-emerald-50/90`}>
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {a.submittedBy ?? 'Student'} ne submit kiya
                        </p>
                        <p className="text-sm text-gray-800 mt-2">
                          Submitted on <strong>{a.submittedAt ?? '—'}</strong>
                        </p>
                        {a.studentNote ? (
                          <p className="text-sm text-gray-700 mt-2 p-3 rounded-lg bg-white/80 border-2 border-white">
                            <span className="font-semibold">Submission note:</span> {a.studentNote}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-600 mt-2">No extra note — student marked assignment as submitted.</p>
                        )}
                        {a.submissionType === 'file' && a.submissionFileUrl && (
                          <a
                            href={a.submissionFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange mt-3 hover:underline"
                          >
                            <Paperclip className="w-4 h-4" />
                            Open file{a.submissionFileName ? ` · ${a.submissionFileName}` : ''}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {a.submissionType === 'link' && a.submissionLink && (
                          <a
                            href={a.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange mt-3 hover:underline break-all"
                          >
                            <Link2 className="w-4 h-4 shrink-0" />
                            {a.submissionLink}
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              )
            })
          )}
        </ul>
          </>
        )}
      </main>
    </>
  )
}

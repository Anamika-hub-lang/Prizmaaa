'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useMentorContent } from '../../context/MentorContentContext'
import { AppButton } from '../ui/AppButton'
import { AppModal } from '../ui/AppModal'
import { createClassNotification } from '../../lib/classNotificationsApi'
import {
  ASSIGNMENT_IMAGE_ACCEPT,
  DEFAULT_ASSIGNMENT_THUMBNAIL,
  isAllowedAssignmentImage,
  MAX_ASSIGNMENT_IMAGE_BYTES,
  MAX_ASSIGNMENT_REFERENCE_IMAGES,
  uploadMentorAssignmentReferenceImages,
} from '../../lib/mentorAssignmentAssetsApi'
import { formatSessionLabel } from '../../lib/sessionSchedule'
import type { MentorAssignment } from '../../types/mentorContent'

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

export function AssignmentFormModal({
  mode,
  assignment,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit'
  assignment?: MentorAssignment
  onClose: () => void
  onSaved?: (assignmentId: string) => void
}) {
  const { myClasses, addAssignment, updateAssignment, usingLocalData } = useMentorContent()
  const { getToken } = useAuth()

  const [title, setTitle] = useState(assignment?.title ?? '')
  const [classId, setClassId] = useState(assignment?.classId ?? '')
  const [due, setDue] = useState(toDatetimeLocalValue(assignment?.due ?? ''))
  const [description, setDescription] = useState(assignment?.description ?? '')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(assignment?.referenceImages ?? [])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews(urls)
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [imageFiles])

  const totalImages = existingImages.length + imageFiles.length

  const appendImages = (list: FileList | null) => {
    if (!list) return
    const next = [...imageFiles]
    for (const file of Array.from(list)) {
      if (existingImages.length + next.length >= MAX_ASSIGNMENT_REFERENCE_IMAGES) {
        setError(`Upload up to ${MAX_ASSIGNMENT_REFERENCE_IMAGES} reference images.`)
        break
      }
      if (!isAllowedAssignmentImage(file)) {
        setError('Reference images must be PNG, JPEG, or WebP.')
        continue
      }
      if (file.size > MAX_ASSIGNMENT_IMAGE_BYTES) {
        setError('Each image must be 8 MB or smaller.')
        continue
      }
      next.push(file)
    }
    setImageFiles(next)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cls = myClasses.find((c) => c.id === classId)
    if (!cls) {
      setError('Choose a class so enrolled students get notified.')
      return
    }
    const dueIso = dueToIso(due)
    if (!dueIso) {
      setError('Pick a valid deadline.')
      return
    }
    const brief = description.trim()
    if (!brief) {
      setError('Add a task description.')
      return
    }

    setError(null)
    setSaving(true)
    const id = mode === 'edit' && assignment ? assignment.id : `asg-${Date.now()}`

    try {
      let uploaded: string[] = []
      if (imageFiles.length > 0) {
        uploaded = usingLocalData
          ? imageFiles.map((file) => URL.createObjectURL(file))
          : await uploadMentorAssignmentReferenceImages(getToken, {
              assignmentId: id,
              files: imageFiles,
            })
      }
      const referenceImages = [...existingImages, ...uploaded]

      if (mode === 'edit' && assignment) {
        updateAssignment(id, {
          title: title.trim(),
          course: cls.title,
          classId: cls.id,
          due: dueIso,
          description: brief,
          referenceImages,
          img: referenceImages[0] ?? assignment.img ?? DEFAULT_ASSIGNMENT_THUMBNAIL,
        })
      } else {
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
          body: `Due ${formatSessionLabel(dueIso)}${brief ? ` — ${brief.slice(0, 120)}` : ''}`,
          linkPath: '/student/assignments',
        }).catch((err) => {
          setError(err instanceof Error ? err.message : 'Assignment saved, but notify failed')
        })
      }

      onSaved?.(id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save assignment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppModal
      title={mode === 'edit' ? 'Edit assignment' : 'Create assignment'}
      subtitle={
        mode === 'edit'
          ? 'Changes apply to every student who can see this assignment.'
          : 'Enrolled students are notified as soon as you publish.'
      }
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          void handleSubmit(e)
        }}
        className="space-y-4"
      >
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
            value={classId ?? ''}
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
            {existingImages.map((src, index) => (
              <div key={`${src}-${index}`} className="relative">
                <img
                  src={src}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white"
                />
                <button
                  type="button"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                  onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== index))}
                  aria-label={`Remove saved image ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {imagePreviews.map((src, index) => (
              <div key={`${imageFiles[index]?.name ?? src}-${index}`} className="relative">
                <img
                  src={src}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white"
                />
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
            {totalImages < MAX_ASSIGNMENT_REFERENCE_IMAGES && (
              <AppButton
                type="button"
                size="sm"
                variant="outlineOrange"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className="w-4 h-4" />
                {totalImages === 0 ? 'Add images' : 'Add more'}
              </AppButton>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPEG, or WebP — up to {MAX_ASSIGNMENT_REFERENCE_IMAGES} images, 8 MB each.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          <AppButton type="submit" className={saving ? 'opacity-70 pointer-events-none' : ''}>
            {saving
              ? 'Saving…'
              : mode === 'edit'
                ? 'Save changes'
                : 'Publish to students'}
          </AppButton>
          <AppButton type="button" variant="outline" onClick={onClose}>
            Cancel
          </AppButton>
        </div>
      </form>
    </AppModal>
  )
}

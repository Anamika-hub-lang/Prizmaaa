import type { FreeCourse } from '../data/classCatalog'
import type { ManagedClass, MentorAssignment, AssignmentSubmissionType } from '../types/mentorContent'
import { pickClassCoverImage } from './classCoverImages'
export type ClassRow = {
  id: string
  title: string
  category_id: string
  image: string
  mentor: string
  mentor_image: string
  duration: string
  sessions: string
  description: string
  price: number
  meet_link: string
  next_session_label: string
  published: boolean
  mentor_clerk_id?: string | null
}

export type FreeCourseRow = {
  id: string
  title: string
  image: string
  instructor: string
  lessons: number
  hours: number
  description: string
  mentor_clerk_id?: string | null
}

export type AssignmentRow = {
  id: string
  title: string
  course: string
  due: string
  img: string | null
  description?: string | null
  reference_images?: unknown
  class_id?: string | null
  pdf_url?: string | null
  pdf_name?: string | null
  status: 'pending' | 'submitted'
  submitted_at: string | null
  student_note: string | null
  submitted_by: string | null
  mentor_clerk_id?: string | null
  submission_type?: AssignmentSubmissionType | null
  submission_file_url?: string | null
  submission_file_name?: string | null
  submission_link?: string | null
}

function parseReferenceImages(value: unknown): string[] {
  let raw = value
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw) as unknown
    } catch {
      return []
    }
  }
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

const PACKED_REFERENCE_PREFIX = 'prizma-refs:'

function unpackPackedReferenceImages(img: string): { img: string; referenceImages: string[] } | null {
  if (!img.startsWith(PACKED_REFERENCE_PREFIX)) return null
  const urls = parseReferenceImages(img.slice(PACKED_REFERENCE_PREFIX.length))
  return { img: urls[0] ?? '', referenceImages: urls }
}

export function packReferenceImagesFallback(urls: string[], cover: string): string {
  if (urls.length === 0) return cover
  return `${PACKED_REFERENCE_PREFIX}${JSON.stringify(urls)}`
}

export function isMissingReferenceImagesColumn(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  const msg = (error?.message ?? '').toLowerCase()
  return msg.includes('reference_images')
}

export function classFromRow(row: ClassRow): ManagedClass {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id as ManagedClass['categoryId'],
    image: pickClassCoverImage({
      id: row.id,
      categoryId: row.category_id as ManagedClass['categoryId'],
      title: row.title,
      image: row.image,
    }),
    mentor: row.mentor,
    mentorImage: row.mentor_image,
    duration: row.duration,
    sessions: row.sessions,
    description: row.description,
    price: row.price,
    meetLink: row.meet_link,
    nextSessionLabel: row.next_session_label,
    published: row.published,
    mentorClerkId: row.mentor_clerk_id ?? null,
  }
}

export function classToRow(c: ManagedClass): ClassRow {
  return {
    id: c.id,
    title: c.title,
    category_id: c.categoryId,
    image: c.image,
    mentor: c.mentor,
    mentor_image: c.mentorImage,
    duration: c.duration,
    sessions: c.sessions,
    description: c.description,
    price: c.price,
    meet_link: c.meetLink,
    next_session_label: c.nextSessionLabel,
    published: c.published,
    mentor_clerk_id: c.mentorClerkId ?? null,
  }
}

export function freeCourseFromRow(row: FreeCourseRow): FreeCourse {
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    instructor: row.instructor,
    lessons: row.lessons,
    hours: row.hours,
    description: row.description,
    mentorClerkId: row.mentor_clerk_id ?? null,
  }
}

export function freeCourseToRow(c: FreeCourse): FreeCourseRow {
  return {
    id: c.id,
    title: c.title,
    image: c.image,
    instructor: c.instructor,
    lessons: c.lessons,
    hours: c.hours,
    description: c.description,
    mentor_clerk_id: c.mentorClerkId ?? null,
  }
}

export function assignmentFromRow(row: AssignmentRow): MentorAssignment {
  const submissionType = row.submission_type === 'file' || row.submission_type === 'link' ? row.submission_type : undefined
  const rawImg = row.img ?? ''
  const packed = unpackPackedReferenceImages(rawImg)
  const referenceImages = parseReferenceImages(row.reference_images)
  const resolvedImages = referenceImages.length > 0 ? referenceImages : packed?.referenceImages ?? []
  return {
    id: row.id,
    title: row.title,
    course: row.course,
    due: row.due,
    img: packed && referenceImages.length === 0 ? packed.img : rawImg,
    description: row.description ?? '',
    referenceImages: resolvedImages,
    classId: row.class_id ?? null,
    pdfUrl: row.pdf_url ?? null,
    pdfName: row.pdf_name ?? null,
    status: row.status,
    submittedAt: row.submitted_at ?? undefined,
    studentNote: row.student_note ?? undefined,
    submittedBy: row.submitted_by ?? undefined,
    mentorClerkId: row.mentor_clerk_id ?? null,
    submissionType,
    submissionFileUrl: row.submission_file_url ?? undefined,
    submissionFileName: row.submission_file_name ?? undefined,
    submissionLink: row.submission_link ?? undefined,
  }
}

export function assignmentToRow(a: MentorAssignment): AssignmentRow {
  const urls = a.referenceImages ?? []
  return {
    id: a.id,
    title: a.title,
    course: a.course,
    due: a.due,
    img: urls.length > 0 ? packReferenceImagesFallback(urls, a.img) : a.img,
    description: a.description ?? '',
    class_id: a.classId ?? null,
    pdf_url: a.pdfUrl ?? null,
    pdf_name: a.pdfName ?? null,
    status: a.status,
    submitted_at: a.submittedAt ?? null,
    student_note: a.studentNote ?? null,
    submitted_by: a.submittedBy ?? null,
    mentor_clerk_id: a.mentorClerkId ?? null,
  }
}

export function assignmentInsertPayload(a: AssignmentRow): Record<string, unknown> {
  return {
    id: a.id,
    title: a.title,
    course: a.course,
    due: a.due,
    img: a.img,
    description: a.description ?? '',
    status: a.status,
    mentor_clerk_id: a.mentor_clerk_id ?? null,
    class_id: a.class_id ?? null,
  }
}

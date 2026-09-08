import type { AssignmentReviewStatus, AssignmentStudentSubmission } from '../types/mentorContent'

const MAX_FILE_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

export const MAX_ASSIGNMENT_REFERENCE_IMAGES = 5
export const MAX_ASSIGNMENT_IMAGE_BYTES = MAX_FILE_BYTES
export const ASSIGNMENT_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp'
export const DEFAULT_ASSIGNMENT_THUMBNAIL =
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80'

async function authFetch(path: string, getToken: () => Promise<string | null>, init?: RequestInit) {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    if (!res.ok) throw new Error(text.slice(0, 120) || `API error (${res.status})`)
  }
  if (!res.ok) throw new Error((data.error as string | undefined) ?? `API error (${res.status})`)
  return data
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const base64 = result.includes(',') ? result.split(',')[1]! : result
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Could not read the image'))
    reader.readAsDataURL(file)
  })
}

function fileExtension(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx).toLowerCase() : ''
}

export function isAllowedAssignmentImage(file: File): boolean {
  if (ALLOWED_TYPES.has(file.type)) return true
  return ALLOWED_EXTENSIONS.has(fileExtension(file.name))
}

export async function uploadMentorAssignmentReferenceImages(
  getToken: () => Promise<string | null>,
  input: { assignmentId: string; files: File[] },
): Promise<string[]> {
  if (input.files.length > MAX_ASSIGNMENT_REFERENCE_IMAGES) {
    throw new Error(`Upload up to ${MAX_ASSIGNMENT_REFERENCE_IMAGES} reference images`)
  }
  const urls: string[] = []
  for (const file of input.files) {
    if (file.size > MAX_FILE_BYTES) {
      throw new Error('Each image must be 8 MB or smaller')
    }
    if (!isAllowedAssignmentImage(file)) {
      throw new Error('Reference images must be PNG, JPEG, or WebP')
    }
    const imageBase64 = await fileToBase64(file)
    const data = await authFetch('/api/mentor/assignments/reference-images', getToken, {
      method: 'POST',
      body: JSON.stringify({
        assignmentId: input.assignmentId,
        imageBase64,
        fileName: file.name || 'reference.png',
      }),
    })
    const url = data.url ? String(data.url) : ''
    if (!url) throw new Error('Upload succeeded but image URL was missing')
    urls.push(url)
  }
  return urls
}

export function parseSubmission(raw: unknown): AssignmentStudentSubmission {
  const item = (raw ?? {}) as Record<string, unknown>
  const status = item.reviewStatus
  return {
    id: String(item.id ?? ''),
    clerkId: String(item.clerkId ?? ''),
    studentName: String(item.studentName ?? 'Student'),
    submittedAt: String(item.submittedAt ?? ''),
    note: typeof item.note === 'string' ? item.note : '',
    type: item.type === 'link' ? 'link' : 'file',
    fileUrl: typeof item.fileUrl === 'string' ? item.fileUrl : null,
    fileName: typeof item.fileName === 'string' ? item.fileName : null,
    link: typeof item.link === 'string' ? item.link : null,
    reviewStatus: status === 'approved' || status === 'rejected' ? status : 'pending',
    reviewNote: typeof item.reviewNote === 'string' ? item.reviewNote : null,
    reviewedAt: typeof item.reviewedAt === 'string' ? item.reviewedAt : null,
  }
}

/** Submissions stored before the assignment_submissions table existed. Read-only. */
export function isLegacySubmissionId(id: string): boolean {
  return id.startsWith('legacy:')
}

export async function fetchAssignmentSubmissions(
  getToken: () => Promise<string | null>,
  assignmentId: string,
): Promise<{ submissions: AssignmentStudentSubmission[]; enrolledCount: number }> {
  const data = await authFetch(
    `/api/mentor/assignments/submissions?assignmentId=${encodeURIComponent(assignmentId)}`,
    getToken,
  )
  const rows = Array.isArray(data.submissions) ? data.submissions : []
  return {
    submissions: rows.map(parseSubmission),
    enrolledCount: Number(data.enrolledCount ?? 0),
  }
}

export async function reviewAssignmentSubmission(
  getToken: () => Promise<string | null>,
  input: {
    assignmentId: string
    submissionId: string
    decision: Exclude<AssignmentReviewStatus, 'pending'>
    note?: string
  },
): Promise<AssignmentStudentSubmission> {
  const note = input.note?.trim() ?? ''
  if (input.decision === 'rejected' && !note) {
    throw new Error('Add a note explaining why you are rejecting this work')
  }
  const data = await authFetch('/api/mentor/assignments/submissions/review', getToken, {
    method: 'POST',
    body: JSON.stringify({
      assignmentId: input.assignmentId,
      submissionId: input.submissionId,
      decision: input.decision,
      note,
    }),
  })
  return parseSubmission(data.submission)
}

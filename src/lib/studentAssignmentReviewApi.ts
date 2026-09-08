import { parseSubmission } from './mentorAssignmentAssetsApi'
import type { AssignmentStudentSubmission } from '../types/mentorContent'

export type StudentSubmissionReview = AssignmentStudentSubmission & {
  assignmentId: string
}

async function authFetch(path: string, getToken: () => Promise<string | null>) {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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

/** The signed-in student's own submissions, so they can see each mentor decision and note. */
export async function fetchMyAssignmentSubmissions(
  getToken: () => Promise<string | null>,
): Promise<StudentSubmissionReview[]> {
  const data = await authFetch('/api/student/assignments/submissions', getToken)
  const rows = Array.isArray(data.submissions) ? data.submissions : []
  return rows.map((row) => {
    const item = (row ?? {}) as Record<string, unknown>
    return {
      ...parseSubmission(item),
      assignmentId: String(item.assignmentId ?? ''),
    }
  })
}

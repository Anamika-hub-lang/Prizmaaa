export type AdminClassEnrollment = {
  id: string
  clerkId: string
  fullName: string
  email: string
  phone: string
  classId: string
  classTitle: string
  kind: string
  status: string
  planTier: string | null
  billingStatus: string | null
  progress: number
  enrolledAt: string
}

export type AdminEnrollmentClassOption = {
  id: string
  title: string
  categoryId: string
  published: boolean
}

export type AdminEnrollmentsPayload = {
  enrollments: AdminClassEnrollment[]
  classes: AdminEnrollmentClassOption[]
}

async function adminEnrollmentsFetch<T>(
  getToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<T> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch('/api/admin/enrollments', {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) throw new Error(data.error ?? 'Could not load enrollments')
  return data
}

export async function fetchAdminEnrollments(
  getToken: () => Promise<string | null>,
): Promise<AdminEnrollmentsPayload> {
  const data = await adminEnrollmentsFetch<{
    enrollments?: AdminClassEnrollment[]
    classes?: AdminEnrollmentClassOption[]
  }>(getToken)
  return {
    enrollments: data.enrollments ?? [],
    classes: data.classes ?? [],
  }
}

export async function grantOfflineEnrollment(
  getToken: () => Promise<string | null>,
  input: { email: string; classId?: string; classTitleQuery?: string; planTier?: string },
): Promise<{ enrolledClassIds: string[] }> {
  const data = await adminEnrollmentsFetch<{ enrolledClassIds?: string[] }>(getToken, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return { enrolledClassIds: data.enrolledClassIds ?? [] }
}

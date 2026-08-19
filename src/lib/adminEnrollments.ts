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

export async function fetchAdminEnrollments(
  getToken: () => Promise<string | null>,
): Promise<AdminClassEnrollment[]> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch('/api/admin/enrollments', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = (await res.json()) as { enrollments?: AdminClassEnrollment[]; error?: string }
  if (!res.ok) throw new Error(data.error ?? 'Could not load enrollments')
  return data.enrollments ?? []
}

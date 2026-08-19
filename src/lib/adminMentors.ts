export type MentorAllowlistEntry = {
  id: string
  email: string
  note: string
  createdAt: string
}

export type MentorApplicationStatus = 'pending' | 'approved' | 'rejected'

export type MentorApplicationRow = {
  id: string
  fullName: string
  email: string
  phone: string
  expertise: string
  experience: string
  message: string
  college: string
  portfolioUrl: string
  status: MentorApplicationStatus
  adminNote: string
  reviewedAt: string | null
  createdAt: string
}

async function adminFetch<T>(
  path: string,
  getToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<T> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}

export async function fetchMentorAllowlist(
  getToken: () => Promise<string | null>,
): Promise<{ emails: MentorAllowlistEntry[]; setupRequired?: boolean; error?: string }> {
  return adminFetch('/api/admin/mentor-allowlist', getToken)
}

export async function addMentorAllowlistEmail(
  getToken: () => Promise<string | null>,
  email: string,
  note?: string,
): Promise<void> {
  await adminFetch('/api/admin/mentor-allowlist', getToken, {
    method: 'POST',
    body: JSON.stringify({ email, note }),
  })
}

export async function removeMentorAllowlistEmail(
  getToken: () => Promise<string | null>,
  email: string,
): Promise<void> {
  await adminFetch(`/api/admin/mentor-allowlist?email=${encodeURIComponent(email)}`, getToken, {
    method: 'DELETE',
  })
}

export async function fetchMentorApplications(
  getToken: () => Promise<string | null>,
): Promise<MentorApplicationRow[]> {
  const data = await adminFetch<{ applications?: MentorApplicationRow[] }>(
    '/api/admin/mentor-applications',
    getToken,
  )
  return data.applications ?? []
}

export async function reviewMentorApplication(
  getToken: () => Promise<string | null>,
  applicationId: string,
  action: 'approve' | 'reject',
  adminNote?: string,
): Promise<void> {
  await adminFetch('/api/admin/mentor-applications', getToken, {
    method: 'POST',
    body: JSON.stringify({ applicationId, action, adminNote }),
  })
}

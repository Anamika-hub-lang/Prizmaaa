export type ClassCoMentor = {
  id: string
  clerkId: string
  email: string
  fullName?: string | null
  invitedByClerkId: string
  createdAt: string
}

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

export async function fetchSharedClassIds(getToken: () => Promise<string | null>): Promise<string[]> {
  const data = await authFetch('/api/mentor/shared-classes', getToken)
  return (data.classIds as string[]) ?? []
}

export async function fetchClassCoMentors(getToken: () => Promise<string | null>, classId: string) {
  const data = await authFetch(`/api/mentor/classes/${encodeURIComponent(classId)}/co-mentors`, getToken)
  return {
    isOwner: Boolean(data.isOwner),
    coMentors: (data.coMentors as ClassCoMentor[]) ?? [],
  }
}

export async function inviteClassCoMentor(
  getToken: () => Promise<string | null>,
  classId: string,
  email: string,
) {
  const data = await authFetch(`/api/mentor/classes/${encodeURIComponent(classId)}/co-mentors`, getToken, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  return {
    coMentor: data.coMentor as ClassCoMentor,
    message: String(data.message ?? 'Invited'),
  }
}

export async function removeClassCoMentor(
  getToken: () => Promise<string | null>,
  classId: string,
  target: { clerkId?: string; email?: string },
) {
  await authFetch(`/api/mentor/classes/${encodeURIComponent(classId)}/co-mentors`, getToken, {
    method: 'DELETE',
    body: JSON.stringify(target),
  })
}

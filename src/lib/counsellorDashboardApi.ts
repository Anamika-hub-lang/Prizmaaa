export type CounsellorType = {
  id: string
  name: string
  subdomain: string
  slug: string
}

export type CounsellorBooking = {
  id: string
  fullName: string
  email: string
  phone: string
  categoryId: string
  groupId: string | null
  preferredMode: string
  note: string | null
  scheduledDate: string | null
  scheduledTime: string | null
  sessionStatus: 'upcoming' | 'completed'
  assignmentStatus: string
  createdAt: string
}

async function authFetch(
  path: string,
  getToken: () => Promise<string | null>,
  init?: RequestInit,
) {
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
  if (!res.ok) {
    throw new Error((data.error as string | undefined) ?? `API error (${res.status})`)
  }
  return data
}

export async function fetchCounsellorMe(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/counsellor/me', getToken)
  return {
    availability: Boolean(data.availability),
    types: (data.types as CounsellorType[]) ?? [],
  }
}

export async function patchCounsellorAvailability(
  getToken: () => Promise<string | null>,
  availability: boolean,
) {
  await authFetch('/api/counsellor/availability', getToken, {
    method: 'PATCH',
    body: JSON.stringify({ availability }),
  })
}

export async function fetchCounsellorBookings(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/counsellor/bookings', getToken)
  return (data.bookings as CounsellorBooking[]) ?? []
}

export async function patchCounsellorBookingStatus(
  getToken: () => Promise<string | null>,
  id: string,
  sessionStatus: 'upcoming' | 'completed',
) {
  await authFetch('/api/counsellor/bookings', getToken, {
    method: 'PATCH',
    body: JSON.stringify({ id, sessionStatus }),
  })
}

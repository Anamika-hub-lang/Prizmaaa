export type CounsellingBookingPayload = {
  fullName: string
  email: string
  phone: string
  categoryId: string
  groupId: string
  preferredMode: 'meet' | 'call'
  scheduledDate: string
  scheduledTime: string
  note?: string
}

export type CounsellingBooking = {
  id: string
  fullName: string
  email: string
  phone: string
  categoryId: string
  groupId: string | null
  preferredMode: 'meet' | 'call'
  note: string | null
  paymentStatus: string
  scheduledDate: string | null
  scheduledTime: string | null
  createdAt: string
}

export async function createCounsellingOrder(
  getToken: () => Promise<string | null>,
  payload: CounsellingBookingPayload,
): Promise<{ paymentSessionId: string; orderId: string; mode: 'sandbox' | 'production' }> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required to book counselling')

  const res = await fetch('/api/counselling/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let data: {
    paymentSessionId?: string
    orderId?: string
    mode?: 'sandbox' | 'production'
    error?: string
  }
  try {
    data = JSON.parse(text) as typeof data
  } catch {
    throw new Error(res.ok ? 'Invalid server response' : text.slice(0, 120) || `API error (${res.status})`)
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Could not start payment')
  }
  if (!data.paymentSessionId || !data.orderId) {
    throw new Error('Invalid payment response')
  }

  return {
    paymentSessionId: data.paymentSessionId,
    orderId: data.orderId,
    mode: data.mode === 'production' ? 'production' : 'sandbox',
  }
}

export async function confirmCounsellingOrder(
  getToken: (options?: { skipCache?: boolean }) => Promise<string | null>,
  orderId: string,
): Promise<{ redirect: string; scheduledDate?: string; scheduledTime?: string }> {
  const token = await getToken({ skipCache: true })
  if (!token) throw new Error('Sign in required')

  const res = await fetch('/api/counselling/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  })

  const text = await res.text()
  let data: {
    redirect?: string
    scheduledDate?: string
    scheduledTime?: string
    error?: string
  }
  try {
    data = JSON.parse(text) as typeof data
  } catch {
    throw new Error(res.ok ? 'Invalid server response' : text.slice(0, 120) || `API error (${res.status})`)
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Payment confirmation failed')
  }

  return {
    redirect: data.redirect ?? '/student',
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime,
  }
}

export async function fetchMyCounsellingBookings(
  getToken: () => Promise<string | null>,
): Promise<CounsellingBooking[]> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')

  const res = await fetch('/api/counselling/my-bookings', {
    headers: { Authorization: `Bearer ${token}` },
  })

  const text = await res.text()
  let data: { bookings?: CounsellingBooking[]; error?: string }
  try {
    data = JSON.parse(text) as typeof data
  } catch {
    throw new Error(res.ok ? 'Invalid server response' : text.slice(0, 120) || `API error (${res.status})`)
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Could not load counselling bookings')
  }

  return data.bookings ?? []
}

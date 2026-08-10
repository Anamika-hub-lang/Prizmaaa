export type AdminCounsellingBooking = {
  id: string
  source: 'paid' | 'pending'
  fullName: string
  email: string
  phone: string
  categoryId: string
  groupId: string | null
  preferredMode: 'meet' | 'call'
  note: string | null
  paymentStatus: 'pending' | 'paid' | 'failed'
  scheduledDate: string | null
  scheduledTime: string | null
  cashfreeOrderId: string | null
  clerkId: string | null
  amountInr: number
  createdAt: string
}

export async function fetchAdminCounsellingBookings(
  getToken: () => Promise<string | null>,
): Promise<AdminCounsellingBooking[]> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')

  const res = await fetch('/api/admin/counselling-bookings', {
    headers: { Authorization: `Bearer ${token}` },
  })

  const text = await res.text()
  let data: { bookings?: AdminCounsellingBooking[]; error?: string }
  try {
    data = JSON.parse(text) as typeof data
  } catch {
    throw new Error(res.ok ? 'Invalid server response' : text.slice(0, 120) || `API error (${res.status})`)
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Could not load admin bookings')
  }

  return data.bookings ?? []
}

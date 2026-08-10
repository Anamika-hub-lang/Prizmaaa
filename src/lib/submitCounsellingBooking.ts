export type CounsellingBookingPayload = {
  fullName: string
  email: string
  phone: string
  categoryId: string
  preferredMode: 'meet' | 'call'
  note?: string
}

export async function submitCounsellingBooking(payload: CounsellingBookingPayload): Promise<void> {
  const res = await fetch('/api/counselling/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let msg = 'Could not book counselling session'
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) msg = data.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
}

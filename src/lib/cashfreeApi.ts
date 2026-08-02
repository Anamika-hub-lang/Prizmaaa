export type CreateCashfreeOrderBody = {
  classId: string
  purpose: 'paid' | 'trial'
  planTier?: 'monthly' | 'three-month'
}

export async function createCashfreeOrder(
  getToken: () => Promise<string | null>,
  body: CreateCashfreeOrderBody,
): Promise<{ paymentSessionId: string; mode: 'sandbox' | 'production' }> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')

  const res = await fetch('/api/cashfree/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let data: { paymentSessionId?: string; mode?: 'sandbox' | 'production'; error?: string }
  try {
    data = JSON.parse(text) as typeof data
  } catch {
    throw new Error(
      res.ok
        ? 'Invalid server response'
        : text.slice(0, 120) || `Payment API error (${res.status})`,
    )
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Could not start Cashfree payment')
  }

  if (!data.paymentSessionId) {
    throw new Error('Invalid Cashfree response')
  }

  const mode = data.mode === 'production' ? 'production' : 'sandbox'
  return { paymentSessionId: data.paymentSessionId, mode }
}

export async function confirmCashfreeOrder(
  getToken: () => Promise<string | null>,
  orderId: string,
): Promise<{ redirect: string }> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')

  const res = await fetch('/api/cashfree/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  })

  const text = await res.text()
  let data: { redirect?: string; error?: string }
  try {
    data = JSON.parse(text) as typeof data
  } catch {
    throw new Error(
      res.ok
        ? 'Invalid server response'
        : text.slice(0, 120) || `Payment API error (${res.status})`,
    )
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Payment confirmation failed')
  }

  return { redirect: data.redirect ?? '/student' }
}

export type CreateCashfreeOrderBody = {
  classId: string
  purpose: 'paid' | 'trial'
  planTier?: 'monthly' | 'three-month'
}

export async function createCashfreeOrder(
  getToken: () => Promise<string | null>,
  body: CreateCashfreeOrderBody,
): Promise<{ paymentSessionId: string }> {
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

  const data = (await res.json()) as { paymentSessionId?: string; error?: string }

  if (!res.ok) {
    throw new Error(data.error ?? 'Could not start Cashfree payment')
  }

  if (!data.paymentSessionId) {
    throw new Error('Invalid Cashfree response')
  }

  return { paymentSessionId: data.paymentSessionId }
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

  const data = (await res.json()) as { redirect?: string; error?: string }

  if (!res.ok) {
    throw new Error(data.error ?? 'Payment confirmation failed')
  }

  return { redirect: data.redirect ?? '/student' }
}

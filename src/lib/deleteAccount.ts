const LOCAL_ENROLLMENTS_KEY = 'educture_student_enrollments'
const PENDING_ORDER_KEY = 'educture_cashfree_order_id'
const AUTH_RETURN_KEY = 'educture_auth_return'

export function clearAccountLocalData(): void {
  try {
    localStorage.removeItem(LOCAL_ENROLLMENTS_KEY)
    localStorage.removeItem(PENDING_ORDER_KEY)
    sessionStorage.removeItem(PENDING_ORDER_KEY)
    sessionStorage.removeItem(AUTH_RETURN_KEY)
  } catch {
    /* ignore */
  }
}

export async function deleteAccountPermanently(
  getToken: () => Promise<string | null>,
): Promise<void> {
  const token = await getToken()
  if (!token) throw new Error('You must be signed in.')

  const res = await fetch('/api/user/delete-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ confirm: 'DELETE' }),
  })

  let data: { error?: string; warning?: string } = {}
  try {
    data = (await res.json()) as { error?: string; warning?: string }
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Could not delete your account.')
  }

  if (data.warning) {
    console.warn('[delete-account]', data.warning)
  }

  clearAccountLocalData()
}

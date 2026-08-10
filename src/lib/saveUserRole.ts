import type { UserRole } from '../types/auth'

export async function saveUserRole(
  role: UserRole,
  getToken: () => Promise<string | null>
): Promise<void> {
  const token = await getToken()
  if (!token) {
    throw new Error('You must be signed in to choose a role.')
  }

  const res = await fetch('/api/user/role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  })

  if (!res.ok) {
    let message = 'Could not save your role. Try again.'
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
}

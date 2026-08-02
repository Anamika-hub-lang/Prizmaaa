/** Sync Clerk user → Supabase profiles via dev/server API (no service key in browser). */
export async function syncUserProfile(getToken: () => Promise<string | null>): Promise<void> {
  const token = await getToken()
  if (!token) return

  const res = await fetch('/api/user/profile-sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    let message = 'Profile sync failed'
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
}

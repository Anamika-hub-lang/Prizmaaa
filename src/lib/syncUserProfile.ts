/** Sync Clerk user → Supabase profiles via dev/server API (no service key in browser). */
export type ProfileSyncResult = {
  ok: boolean
  roleUpdated: boolean
}

export async function syncUserProfile(
  getToken: () => Promise<string | null>,
): Promise<ProfileSyncResult> {
  const token = await getToken()
  if (!token) return { ok: false, roleUpdated: false }

  const res = await fetch('/api/user/profile-sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  let data: { error?: string; roleUpdated?: boolean } = {}
  try {
    data = (await res.json()) as typeof data
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Profile sync failed')
  }

  return { ok: true, roleUpdated: Boolean(data.roleUpdated) }
}

export async function fetchMentorEligible(
  getToken: () => Promise<string | null>,
): Promise<{ allowed: boolean; email: string }> {
  const token = await getToken()
  if (!token) return { allowed: false, email: '' }
  const res = await fetch('/api/user/mentor-eligible', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = (await res.json()) as { allowed?: boolean; email?: string; error?: string }
  if (!res.ok) return { allowed: false, email: data.email ?? '' }
  return { allowed: Boolean(data.allowed), email: data.email ?? '' }
}

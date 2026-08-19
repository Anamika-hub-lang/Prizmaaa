export type MentorApplicationPrefill = {
  fullName: string
  email: string
  phone: string | null
  college: string | null
  expertise: string
  experience: string | null
  message: string | null
  portfolioUrl: string | null
}

export async function fetchMentorApplicationPrefill(
  getToken: () => Promise<string | null>,
): Promise<MentorApplicationPrefill | null> {
  const token = await getToken()
  if (!token) return null

  const res = await fetch('/api/user/mentor-application', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return null

  const data = (await res.json()) as { application?: MentorApplicationPrefill | null }
  return data.application ?? null
}

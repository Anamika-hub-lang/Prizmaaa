import type { ProfileDetailsPayload } from '../data/onboardingFields'

export async function saveProfileDetails(
  getToken: () => Promise<string | null>,
  payload: ProfileDetailsPayload,
): Promise<void> {
  const token = await getToken()
  if (!token) throw new Error('You must be signed in.')

  const res = await fetch('/api/user/profile-details', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = 'Could not save your details.'
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
}

export type UserProfileRecord = {
  clerk_id: string
  full_name: string | null
  email: string | null
  role: string | null
  phone: string | null
  city: string | null
  how_did_you_find_us: string | null
  how_did_you_find_us_detail: string | null
  student_education_level: string | null
  student_grade_or_program: string | null
  student_learning_goals: string | null
  mentor_expertise: string | null
  mentor_experience_years: number | null
  mentor_qualifications: string | null
  mentor_bio: string | null
  mentor_portfolio_url: string | null
  profile_details_complete: boolean
}

export async function fetchUserProfile(
  getToken: () => Promise<string | null>,
): Promise<UserProfileRecord | null> {
  const token = await getToken()
  if (!token) return null

  const res = await fetch('/api/user/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return null
  const data = (await res.json()) as { profile?: UserProfileRecord | null }
  return data.profile ?? null
}

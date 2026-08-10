export type ProfileUpsertRow = {
  clerk_id: string
  full_name: string | null
  email: string | null
  role: 'student' | 'teacher' | null
  avatar_url: string | null
}

export type ProfileDetailsRow = {
  clerk_id: string
  full_name: string
  email: string | null
  role: 'student' | 'teacher'
  phone: string | null
  city: string | null
  how_did_you_find_us: string
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

function normalizeRole(value: unknown): 'student' | 'teacher' | null {
  if (value === 'student' || value === 'teacher') return value
  return null
}

type ClerkApiUser = {
  id: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  imageUrl: string
  primaryEmailAddress?: { emailAddress: string } | null
  emailAddresses: Array<{ emailAddress: string }>
  publicMetadata?: Record<string, unknown>
}

/** Map Clerk Backend API user to Supabase profiles row (no secrets). */
export function profileRowFromClerkUser(user: ClerkApiUser): ProfileUpsertRow {
  const fullName =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    null

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null

  return {
    clerk_id: user.id,
    full_name: fullName,
    email,
    role: normalizeRole(user.publicMetadata?.role),
    avatar_url: user.imageUrl ?? null,
  }
}

/** Clerk webhook JSON (user.created / user.updated). */
export function profileRowFromClerkWebhook(data: Record<string, unknown>): ProfileUpsertRow {
  const clerkId = String(data.id ?? '')
  const first = (data.first_name as string | null | undefined) ?? null
  const last = (data.last_name as string | null | undefined) ?? null
  const fullName = [first, last].filter(Boolean).join(' ').trim() || null

  const emails = data.email_addresses as
    | Array<{ id: string; email_address: string }>
    | undefined
  const primaryId = data.primary_email_address_id as string | undefined
  const primary = emails?.find((e) => e.id === primaryId) ?? emails?.[0]

  const publicMeta = data.public_metadata as { role?: unknown } | undefined

  return {
    clerk_id: clerkId,
    full_name: fullName,
    email: primary?.email_address ?? null,
    role: normalizeRole(publicMeta?.role),
    avatar_url: (data.image_url as string | null | undefined) ?? null,
  }
}

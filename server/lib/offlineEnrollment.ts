import { createClerkClient } from '@clerk/backend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ensurePaidClassEnrollment } from './enrollmentAdmin'
import { normalizeRole, profileRowFromClerkUser } from './profileRow'
import { upsertProfile } from './supabaseAdmin'

type ClerkClient = ReturnType<typeof createClerkClient>

export type OfflinePlanTier = 'monthly' | 'three-month' | 'six-month'

export type OfflineEnrollmentGrant = {
  email: string
  classId?: string
  classTitleQuery?: string
  planTier?: OfflinePlanTier
  paymentLabel?: string
}

type ClerkUserLike = {
  id: string
  publicMetadata?: Record<string, unknown>
  emailAddresses: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId: string | null
  firstName: string | null
  lastName: string | null
  fullName: string | null
  imageUrl: string
  primaryEmailAddress?: { emailAddress: string } | null
}

export type ApplyOfflineEnrollmentResult = {
  matched: boolean
  roleUpdated: boolean
  enrolledClassIds: string[]
  classMissing: boolean
}

/**
 * Personal / offline payments: these emails skip website checkout.
 * On sign-in they become a student and get the matched live class (and its updates).
 */
export const BUILTIN_OFFLINE_ENROLLMENT_GRANTS: OfflineEnrollmentGrant[] = [
  {
    email: 'ritikarathee400@gmail.com',
    classTitleQuery: 'full stack',
    planTier: 'monthly',
    paymentLabel: 'Offline / personal payment',
  },
]

export function normalizeGrantEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function clerkUserEmail(user: ClerkUserLike): string {
  const primary = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
  return normalizeGrantEmail(primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? '')
}

function titleMatchesQuery(title: string, query: string): boolean {
  const normalizedTitle = title.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()
  const normalizedQuery = query.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!normalizedQuery) return false
  if (normalizedTitle.includes(normalizedQuery)) return true
  return normalizedTitle.replace(/\s+/g, '').includes(normalizedQuery.replace(/\s+/g, ''))
}

function grantsForEmail(
  email: string,
  extra: OfflineEnrollmentGrant[] = [],
): OfflineEnrollmentGrant[] {
  const normalized = normalizeGrantEmail(email)
  if (!normalized) return []
  return [...BUILTIN_OFFLINE_ENROLLMENT_GRANTS, ...extra].filter(
    (grant) => normalizeGrantEmail(grant.email) === normalized,
  )
}

export function hasOfflineEnrollmentGrant(email: string): boolean {
  return grantsForEmail(email).length > 0
}

export async function resolveClassForGrant(
  supabase: SupabaseClient,
  grant: OfflineEnrollmentGrant,
): Promise<{ id: string; title: string } | null> {
  if (grant.classId?.trim()) {
    const { data } = await supabase
      .from('classes')
      .select('id, title')
      .eq('id', grant.classId.trim())
      .maybeSingle()
    if (data?.id) return { id: String(data.id), title: String(data.title ?? '') }
  }

  const query = grant.classTitleQuery?.trim()
  if (!query) return null

  const { data, error } = await supabase
    .from('classes')
    .select('id, title, category_id, published, created_at')
  if (error || !data?.length) return null

  const matches = data.filter((row) => titleMatchesQuery(String(row.title ?? ''), query))
  if (matches.length === 0) return null

  matches.sort((a, b) => {
    const published = Number(Boolean(b.published)) - Number(Boolean(a.published))
    if (published !== 0) return published
    const professional =
      Number(String(b.category_id) === 'professional') - Number(String(a.category_id) === 'professional')
    if (professional !== 0) return professional
    return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))
  })

  const best = matches[0]
  return { id: String(best.id), title: String(best.title ?? '') }
}

async function ensureStudentDashboardRole(
  clerk: ClerkClient,
  supabase: SupabaseClient,
  user: ClerkUserLike,
): Promise<boolean> {
  const existingRole = normalizeRole(user.publicMetadata?.role)
  if (existingRole === 'admin' || existingRole === 'teacher' || existingRole === 'counsellor' || existingRole === 'intern') {
    return false
  }

  const alreadyStudent =
    existingRole === 'student' && user.publicMetadata?.onboardingComplete === true
  if (alreadyStudent) return false

  await clerk.users.updateUser(user.id, {
    publicMetadata: {
      ...user.publicMetadata,
      role: 'student',
      onboardingComplete: true,
    },
  })

  const updated = await clerk.users.getUser(user.id)
  try {
    await upsertProfile(supabase, profileRowFromClerkUser(updated))
  } catch (err) {
    console.warn('[offline-enrollment] profile role sync failed', err)
  }
  return true
}

export async function applyOfflineEnrollmentGrants(input: {
  supabase: SupabaseClient
  clerk: ClerkClient
  user: ClerkUserLike
  extraGrants?: OfflineEnrollmentGrant[]
}): Promise<ApplyOfflineEnrollmentResult> {
  const email = clerkUserEmail(input.user)
  const grants = grantsForEmail(email, input.extraGrants)
  if (grants.length === 0) {
    return { matched: false, roleUpdated: false, enrolledClassIds: [], classMissing: false }
  }

  const enrolledClassIds: string[] = []
  let classMissing = false

  for (const grant of grants) {
    const resolved = await resolveClassForGrant(input.supabase, grant)
    if (!resolved) {
      classMissing = true
      continue
    }
    const result = await ensurePaidClassEnrollment(input.supabase, {
      clerkId: input.user.id,
      classId: resolved.id,
      planTier: grant.planTier ?? 'monthly',
      paymentLabel: grant.paymentLabel ?? 'Offline / personal payment',
    })
    if (result === 'created' || result === 'already_active') {
      enrolledClassIds.push(resolved.id)
    }
  }

  const roleUpdated = await ensureStudentDashboardRole(input.clerk, input.supabase, input.user)
  return {
    matched: true,
    roleUpdated,
    enrolledClassIds: [...new Set(enrolledClassIds)],
    classMissing: classMissing && enrolledClassIds.length === 0,
  }
}

export async function findClerkUserByEmail(
  clerkSecretKey: string,
  email: string,
): Promise<ClerkUserLike | null> {
  const normalized = normalizeGrantEmail(email)
  if (!normalized || !normalized.includes('@')) return null
  const clerk = createClerkClient({ secretKey: clerkSecretKey })
  const list = await clerk.users.getUserList({ emailAddress: [normalized], limit: 1 })
  const user = list.data[0]
  return user ?? null
}

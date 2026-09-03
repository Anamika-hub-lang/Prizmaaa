import { createClerkClient } from '@clerk/backend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeRole, profileRowFromClerkUser } from './profileRow'
import { upsertProfile } from './supabaseAdmin'

type ClerkClient = ReturnType<typeof createClerkClient>

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42P01' || error.code === 'PGRST205' || /does not exist/i.test(error.message ?? '')
}

export type BuiltinMentorGrant = {
  /** Full email, or local-part only (e.g. anu99sgt) to match any domain. */
  email: string
  note: string
  /** When true, orphaned/unclaimed classes are reassigned to this mentor on login. */
  reclaimOrphanedContent?: boolean
}

/**
 * Permanent mentors who own platform content. Kept in code so access survives
 * allowlist UI deletes / DB resets.
 */
export const BUILTIN_MENTOR_GRANTS: BuiltinMentorGrant[] = [
  {
    email: 'anu99sgt@gmail.com',
    note: 'Primary mentor — created original courses',
    reclaimOrphanedContent: true,
  },
  {
    email: 'anu99sgt',
    note: 'Primary mentor (any domain)',
    reclaimOrphanedContent: true,
  },
]

function clerkUserEmail(user: ClerkUserLike): string {
  const primary = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
  return normalizeEmail(primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? '')
}

function emailMatchesGrant(email: string, grantEmail: string): boolean {
  const normalized = normalizeEmail(email)
  const grant = normalizeEmail(grantEmail)
  if (!normalized || !grant) return false
  if (normalized === grant) return true
  if (!grant.includes('@')) {
    const local = normalized.split('@')[0] ?? ''
    return local === grant
  }
  return false
}

export function findBuiltinMentorGrant(email: string): BuiltinMentorGrant | null {
  return BUILTIN_MENTOR_GRANTS.find((g) => emailMatchesGrant(email, g.email)) ?? null
}

export function isBuiltinMentorEmail(email: string): boolean {
  return findBuiltinMentorGrant(email) !== null
}

export function builtinMentorAllowlistEntries(): Array<{
  id: string
  email: string
  note: string
  createdAt: string
  permanent: boolean
}> {
  const seen = new Set<string>()
  const out: Array<{
    id: string
    email: string
    note: string
    createdAt: string
    permanent: boolean
  }> = []
  for (const grant of BUILTIN_MENTOR_GRANTS) {
    const email = normalizeEmail(grant.email)
    if (!email.includes('@')) continue
    if (seen.has(email)) continue
    seen.add(email)
    out.push({
      id: `builtin-${email}`,
      email,
      note: grant.note,
      createdAt: '2024-01-01T00:00:00.000Z',
      permanent: true,
    })
  }
  return out
}

async function reclaimOrphanedMentorContent(
  supabase: SupabaseClient,
  clerkId: string,
): Promise<number> {
  const tables = ['classes', 'free_courses', 'assignments'] as const
  let claimed = 0

  for (const table of tables) {
    const { data: rows, error } = await supabase.from(table).select('id, mentor_clerk_id')
    if (error || !rows?.length) continue

    const ownerIds = [
      ...new Set(
        rows
          .map((r) => String(r.mentor_clerk_id ?? '').trim())
          .filter((id) => id && id !== clerkId),
      ),
    ]

    const liveOwners = new Set<string>()
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('clerk_id')
        .in('clerk_id', ownerIds)
      for (const p of profiles ?? []) {
        const id = String(p.clerk_id ?? '').trim()
        if (id) liveOwners.add(id)
      }
    }

    for (const row of rows) {
      const owner = String(row.mentor_clerk_id ?? '').trim()
      if (owner === clerkId) continue
      const orphaned = !owner || !liveOwners.has(owner)
      if (!orphaned) continue

      const { error: updateError } = await supabase
        .from(table)
        .update({ mentor_clerk_id: clerkId })
        .eq('id', row.id)
      if (!updateError) claimed += 1
    }
  }

  return claimed
}

export async function ensureBuiltinMentorAccess(input: {
  supabase: SupabaseClient
  clerk: ClerkClient
  user: ClerkUserLike
}): Promise<{ matched: boolean; roleUpdated: boolean; claimedContent: number }> {
  const email = clerkUserEmail(input.user)
  const grant = findBuiltinMentorGrant(email)
  if (!grant) {
    return { matched: false, roleUpdated: false, claimedContent: 0 }
  }

  const allowlistEmail = email.includes('@') ? email : 'anu99sgt@gmail.com'

  try {
    const { error } = await input.supabase.from('mentor_allowlist').upsert(
      {
        email: allowlistEmail,
        note: grant.note,
      },
      { onConflict: 'email' },
    )
    if (error && !isMissingTableError(error)) {
      console.warn('[builtin-mentor] allowlist upsert failed', error.message)
    }
  } catch (err) {
    console.warn('[builtin-mentor] allowlist upsert error', err)
  }

  const existingRole = normalizeRole(input.user.publicMetadata?.role)
  if (existingRole === 'admin') {
    const claimedContent = grant.reclaimOrphanedContent
      ? await reclaimOrphanedMentorContent(input.supabase, input.user.id)
      : 0
    return { matched: true, roleUpdated: false, claimedContent }
  }

  let roleUpdated = false
  const needsTeacher =
    existingRole !== 'teacher' || input.user.publicMetadata?.onboardingComplete !== true

  if (needsTeacher) {
    await input.clerk.users.updateUser(input.user.id, {
      publicMetadata: {
        ...input.user.publicMetadata,
        role: 'teacher',
        onboardingComplete: true,
      },
    })
    roleUpdated = true
    const updated = await input.clerk.users.getUser(input.user.id)
    try {
      await upsertProfile(input.supabase, profileRowFromClerkUser(updated))
    } catch (err) {
      console.warn('[builtin-mentor] profile sync failed', err)
    }
  }

  const claimedContent = grant.reclaimOrphanedContent
    ? await reclaimOrphanedMentorContent(input.supabase, input.user.id)
    : 0

  return { matched: true, roleUpdated, claimedContent }
}

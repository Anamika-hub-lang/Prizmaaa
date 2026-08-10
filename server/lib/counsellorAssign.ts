import type { SupabaseClient } from '@supabase/supabase-js'

/** Map legacy public funnel group ids → counselling_types.slug */
export function groupIdToTypeSlug(groupId: string | null | undefined): string {
  switch (groupId) {
    case 'career':
      return 'career'
    case 'domain':
      return 'tech'
    case 'future':
      return 'abroad'
    case 'abroad':
      return 'abroad'
    case 'tech':
      return 'tech'
    default:
      return 'career'
  }
}

export async function resolveCounsellingTypeId(
  supabase: SupabaseClient,
  groupId: string | null | undefined,
): Promise<string | null> {
  const slug = groupIdToTypeSlug(groupId)
  const { data } = await supabase
    .from('counselling_types')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  return (data?.id as string | undefined) ?? null
}

/**
 * Pick an available counsellor for a type with the fewest upcoming bookings.
 * Returns null when none available → caller should mark unassigned.
 */
export async function pickLeastLoadedCounsellor(
  supabase: SupabaseClient,
  typeId: string,
): Promise<string | null> {
  const { data: assignments, error: assignErr } = await supabase
    .from('counsellor_type_assignments')
    .select('clerk_id')
    .eq('type_id', typeId)

  if (assignErr || !assignments?.length) return null

  const clerkIds = [...new Set(assignments.map((a) => a.clerk_id as string))]

  const { data: profiles } = await supabase
    .from('counsellor_profiles')
    .select('clerk_id, availability')
    .in('clerk_id', clerkIds)
    .eq('availability', true)

  const available = (profiles ?? []).map((p) => p.clerk_id as string)
  if (!available.length) return null

  const { data: bookings } = await supabase
    .from('counselling_requests')
    .select('counsellor_clerk_id')
    .in('counsellor_clerk_id', available)
    .eq('session_status', 'upcoming')
    .eq('assignment_status', 'assigned')

  const counts = new Map<string, number>()
  for (const id of available) counts.set(id, 0)
  for (const row of bookings ?? []) {
    const id = row.counsellor_clerk_id as string | null
    if (!id) continue
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  let best: string | null = null
  let bestCount = Number.POSITIVE_INFINITY
  for (const id of available) {
    const c = counts.get(id) ?? 0
    if (c < bestCount) {
      best = id
      bestCount = c
    }
  }
  return best
}

export type AssignmentResult = {
  typeId: string | null
  counsellorClerkId: string | null
  assignmentStatus: 'assigned' | 'unassigned'
  sessionStatus: 'upcoming'
}

export async function resolveBookingAssignment(
  supabase: SupabaseClient,
  groupId: string | null | undefined,
): Promise<AssignmentResult> {
  const typeId = await resolveCounsellingTypeId(supabase, groupId)
  if (!typeId) {
    return {
      typeId: null,
      counsellorClerkId: null,
      assignmentStatus: 'unassigned',
      sessionStatus: 'upcoming',
    }
  }

  const counsellorClerkId = await pickLeastLoadedCounsellor(supabase, typeId)
  return {
    typeId,
    counsellorClerkId,
    assignmentStatus: counsellorClerkId ? 'assigned' : 'unassigned',
    sessionStatus: 'upcoming',
  }
}

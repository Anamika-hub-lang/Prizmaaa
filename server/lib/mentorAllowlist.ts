import type { SupabaseClient } from '@supabase/supabase-js'

export function normalizeMentorEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42P01' || error.code === 'PGRST205' || /does not exist/i.test(error.message ?? '')
}

export async function isMentorEmailAllowed(
  supabase: SupabaseClient,
  email: string,
): Promise<boolean> {
  const normalized = normalizeMentorEmail(email)
  if (!normalized) return false
  const { data, error } = await supabase
    .from('mentor_allowlist')
    .select('email')
    .ilike('email', normalized)
    .maybeSingle()
  if (error) {
    if (!isMissingTableError(error)) throw error
  } else if (data?.email) {
    return true
  }

  const { data: approvedApp, error: appError } = await supabase
    .from('mentor_applications')
    .select('id')
    .ilike('email', normalized)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle()

  if (appError) {
    if (isMissingTableError(appError)) return false
    throw appError
  }

  return Boolean(approvedApp?.id)
}

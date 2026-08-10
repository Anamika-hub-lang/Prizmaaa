import type { SupabaseClient } from '@supabase/supabase-js'

type SupabaseErrorLike = { code?: string; message?: string }

function isMissingTableError(error: SupabaseErrorLike): boolean {
  const code = error.code ?? ''
  const msg = (error.message ?? '').toLowerCase()
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === 'PGRST106' ||
    msg.includes('schema cache') ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  )
}

async function deleteByClerkId(
  supabase: SupabaseClient,
  table: string,
  clerkId: string,
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('clerk_id', clerkId)
  if (!error) return
  if (isMissingTableError(error)) {
    console.warn(`[purge-user] skip missing table ${table}:`, error.message)
    return
  }
  console.error(`[purge-user] delete ${table}`, error)
  throw new Error(`Could not remove ${table}`)
}

/** Remove all Supabase rows tied to a Clerk user id. */
export async function purgeUserDataFromSupabase(
  supabase: SupabaseClient,
  clerkId: string,
): Promise<void> {
  const { error: rpcError } = await supabase.rpc('purge_clerk_user', { p_clerk_id: clerkId })
  if (!rpcError) return

  if (rpcError.code !== 'PGRST202' && !isMissingTableError(rpcError)) {
    console.warn('[purge-user] rpc purge_clerk_user failed, falling back:', rpcError.message)
  }

  await deleteByClerkId(supabase, 'student_enrollments', clerkId)
  await deleteByClerkId(supabase, 'cashfree_order_intents', clerkId)
  await deleteByClerkId(supabase, 'profiles', clerkId)
}

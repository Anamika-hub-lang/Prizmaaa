import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { ProfileUpsertRow } from './profileRow'

export function createServiceSupabase(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function upsertProfile(
  supabase: SupabaseClient,
  row: ProfileUpsertRow
): Promise<void> {
  if (!row.clerk_id) {
    throw new Error('clerk_id is required')
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      clerk_id: row.clerk_id,
      full_name: row.full_name,
      email: row.email,
      role: row.role,
      avatar_url: row.avatar_url,
    },
    { onConflict: 'clerk_id' }
  )

  if (error) {
    throw error
  }
}

export async function upsertProfileDetails(
  supabase: SupabaseClient,
  row: import('./profileRow.js').ProfileDetailsRow
): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      clerk_id: row.clerk_id,
      full_name: row.full_name,
      email: row.email,
      role: row.role,
      phone: row.phone,
      city: row.city,
      how_did_you_find_us: row.how_did_you_find_us,
      how_did_you_find_us_detail: row.how_did_you_find_us_detail,
      student_education_level: row.student_education_level,
      student_grade_or_program: row.student_grade_or_program,
      student_learning_goals: row.student_learning_goals,
      mentor_expertise: row.mentor_expertise,
      mentor_experience_years: row.mentor_experience_years,
      mentor_qualifications: row.mentor_qualifications,
      mentor_bio: row.mentor_bio,
      mentor_portfolio_url: row.mentor_portfolio_url,
      profile_details_complete: row.profile_details_complete,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_id' }
  )

  if (error) {
    throw error
  }
}

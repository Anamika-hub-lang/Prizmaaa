import type { SupabaseClient } from '@supabase/supabase-js'

export type CounsellingBookingIntentRow = {
  order_id: string
  clerk_id: string
  full_name: string
  email: string
  phone: string
  category_id: string
  group_id: string | null
  preferred_mode: 'meet' | 'call'
  note: string | null
  scheduled_date: string
  scheduled_time: string
  amount_inr: number
  created_at?: string
}

export async function upsertCounsellingBookingIntent(
  supabase: SupabaseClient,
  row: Omit<CounsellingBookingIntentRow, 'created_at'>,
): Promise<void> {
  const { error } = await supabase.from('counselling_booking_intents').upsert(row, {
    onConflict: 'order_id',
  })
  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') {
      throw new Error('Counselling booking table missing — run counselling-booking-intents.sql in Supabase')
    }
    throw new Error(`Could not save booking intent: ${error.message}`)
  }
}

export async function getCounsellingBookingIntent(
  supabase: SupabaseClient,
  orderId: string,
): Promise<CounsellingBookingIntentRow | null> {
  const { data, error } = await supabase
    .from('counselling_booking_intents')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') return null
    throw new Error(`Could not load booking intent: ${error.message}`)
  }
  return data as CounsellingBookingIntentRow | null
}

export async function deleteCounsellingBookingIntent(
  supabase: SupabaseClient,
  orderId: string,
): Promise<void> {
  await supabase.from('counselling_booking_intents').delete().eq('order_id', orderId)
}

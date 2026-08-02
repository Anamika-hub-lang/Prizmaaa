import type { SupabaseClient } from '@supabase/supabase-js'

export type PaymentOrderNote = {
  v: 1
  clerkId: string
  classId: string
  purpose: 'paid' | 'trial'
  planTier?: 'monthly' | 'three-month'
}

export function parseOrderNote(raw: string | undefined | null): PaymentOrderNote | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as PaymentOrderNote
    if (parsed.v !== 1 || !parsed.clerkId || !parsed.classId || !parsed.purpose) return null
    return parsed
  } catch {
    return null
  }
}

function trialEndIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

import {
  isActiveEnrollmentRow,
  activeEnrollmentBlockedMessage,
} from './enrollmentPolicy.js'

export async function upsertEnrollmentAfterPayment(
  supabase: SupabaseClient,
  note: PaymentOrderNote,
  paymentLabel: string,
  trialDays: number,
): Promise<void> {
  const { data: existing } = await supabase
    .from('student_enrollments')
    .select('id, progress, enrolled_at, billing_status, status, plan_tier')
    .eq('clerk_id', note.clerkId)
    .eq('class_id', note.classId)
    .maybeSingle()

  if (existing && isActiveEnrollmentRow(existing)) {
    throw new Error(activeEnrollmentBlockedMessage(existing.plan_tier))
  }

  if (note.purpose === 'trial') {
    const row = {
      clerk_id: note.clerkId,
      class_id: note.classId,
      kind: 'online',
      progress: existing?.progress ?? 0,
      status: 'ongoing',
      plan_tier: 'trial',
      billing_status: 'trial',
      trial_ends_at: trialEndIso(trialDays),
      payment_method_type: 'card',
      payment_method_label: paymentLabel,
      auto_renew: true,
    }
    if (existing?.id) {
      await supabase.from('student_enrollments').update(row).eq('id', existing.id)
    } else {
      await supabase.from('student_enrollments').insert(row)
    }
    return
  }

  const tier = note.planTier ?? 'monthly'
  const row = {
    clerk_id: note.clerkId,
    class_id: note.classId,
    kind: 'online',
    progress: existing?.progress ?? 0,
    status: 'ongoing',
    plan_tier: tier,
    billing_status: 'active',
    trial_ends_at: null,
    payment_method_type: 'card',
    payment_method_label: paymentLabel,
    auto_renew: true,
  }
  if (existing?.id) {
    await supabase.from('student_enrollments').update(row).eq('id', existing.id)
  } else {
    await supabase.from('student_enrollments').insert(row)
  }
}

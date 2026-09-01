import type { SupabaseClient } from '@supabase/supabase-js'
import type { PaymentOrderNote } from './cashfreeOrderNote'
export type { PaymentOrderNote } from './cashfreeOrderNote'
export { parseOrderNote, normalizeCashfreeOrderNoteRaw } from './cashfreeOrderNote'

function trialEndIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

import {
  isActiveEnrollmentRow,
  activeEnrollmentBlockedMessage,
} from './enrollmentPolicy'

function enrollmentWriteError(error: { message?: string; code?: string }): Error {
  const msg = error.message ?? 'Could not save enrollment'
  if (
    error.code === '42703' ||
    msg.includes('billing_status') ||
    msg.includes('trial_ends_at') ||
    msg.includes('payment_method')
  ) {
    return new Error(
      'Trial billing columns missing in Supabase. Run supabase/enrollment-billing.sql in the SQL Editor.',
    )
  }
  if (error.code === '23503') {
    return new Error('Class not found in database. Mentor must publish the class in Supabase first.')
  }
  if (error.code === '23505') {
    return new Error('Enrollment already exists for this class.')
  }
  return new Error(msg)
}

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

  if (
    existing &&
    isActiveEnrollmentRow(existing) &&
    note.purpose === 'trial'
  ) {
    throw new Error(activeEnrollmentBlockedMessage(existing.plan_tier))
  }

  if (
    existing &&
    isActiveEnrollmentRow(existing) &&
    note.purpose === 'paid' &&
    existing.plan_tier !== 'trial' &&
    existing.billing_status !== 'trial'
  ) {
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
      auto_renew: false,
    }
    if (existing?.id) {
      const { error } = await supabase.from('student_enrollments').update(row).eq('id', existing.id)
      if (error) throw enrollmentWriteError(error)
    } else {
      const { error } = await supabase.from('student_enrollments').insert(row)
      if (error) throw enrollmentWriteError(error)
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
    auto_renew: false,
  }
  if (existing?.id) {
    const { error } = await supabase.from('student_enrollments').update(row).eq('id', existing.id)
    if (error) throw enrollmentWriteError(error)
  } else {
    const { error } = await supabase.from('student_enrollments').insert(row)
    if (error) throw enrollmentWriteError(error)
  }
}

/** Idempotent paid enrollment for offline / personal payments (does not throw if already active). */
export async function ensurePaidClassEnrollment(
  supabase: SupabaseClient,
  input: {
    clerkId: string
    classId: string
    planTier: 'monthly' | 'three-month' | 'six-month'
    paymentLabel: string
  },
): Promise<'created' | 'already_active'> {
  const { data: existing, error: existingError } = await supabase
    .from('student_enrollments')
    .select('id, progress, billing_status, status, plan_tier')
    .eq('clerk_id', input.clerkId)
    .eq('class_id', input.classId)
    .maybeSingle()

  if (existingError) throw enrollmentWriteError(existingError)

  if (
    existing &&
    isActiveEnrollmentRow(existing) &&
    existing.billing_status === 'active' &&
    existing.plan_tier !== 'trial'
  ) {
    return 'already_active'
  }

  const row = {
    clerk_id: input.clerkId,
    class_id: input.classId,
    kind: 'online',
    progress: existing?.progress ?? 0,
    status: 'ongoing',
    plan_tier: input.planTier,
    billing_status: 'active',
    trial_ends_at: null,
    payment_method_type: 'upi',
    payment_method_label: input.paymentLabel,
    auto_renew: false,
  }
  if (existing?.id) {
    const { error } = await supabase.from('student_enrollments').update(row).eq('id', existing.id)
    if (error) throw enrollmentWriteError(error)
  } else {
    const { error } = await supabase.from('student_enrollments').insert(row)
    if (error) throw enrollmentWriteError(error)
  }
  return 'created'
}

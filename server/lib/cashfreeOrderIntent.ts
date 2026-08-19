import type { SupabaseClient } from '@supabase/supabase-js'
import type { PaymentOrderNote } from './cashfreeOrderNote'
import { parseOrderNote, paymentNoteFromIntent } from './cashfreeOrderNote'

export type CashfreeOrderIntentRow = {
  order_id: string
  clerk_id: string
  class_id: string
  purpose: 'paid' | 'trial'
  plan_tier: 'monthly' | 'three-month' | 'six-month' | null
  created_at?: string
}

export async function upsertCashfreeOrderIntent(
  supabase: SupabaseClient,
  row: Omit<CashfreeOrderIntentRow, 'created_at'>,
): Promise<void> {
  const { error } = await supabase.from('cashfree_order_intents').upsert(
    {
      order_id: row.order_id,
      clerk_id: row.clerk_id,
      class_id: row.class_id,
      purpose: row.purpose,
      plan_tier: row.plan_tier,
    },
    { onConflict: 'order_id' },
  )
  if (error) {
    throw new Error(`Could not save order intent: ${error.message}`)
  }
}

export async function getCashfreeOrderIntent(
  supabase: SupabaseClient,
  orderId: string,
): Promise<CashfreeOrderIntentRow | null> {
  const { data, error } = await supabase
    .from('cashfree_order_intents')
    .select('order_id, clerk_id, class_id, purpose, plan_tier, created_at')
    .eq('order_id', orderId)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01') return null
    throw new Error(`Could not load order intent: ${error.message}`)
  }
  return data as CashfreeOrderIntentRow | null
}

export type ResolvePaymentNoteResult =
  | { ok: true; note: PaymentOrderNote; source: 'order_note' | 'intent' | 'both' }
  | { ok: false; code: string; message: string; details: Record<string, unknown> }

/**
 * Bind enrollment to the signed-in Clerk user using Cashfree customer_id, parsed order_note,
 * and server-stored intent (create-order). All available sources must agree when present.
 */
export function resolvePaymentEnrollmentNote(input: {
  clerkId: string
  orderId: string
  rawOrderNote: string | undefined | null
  cashfreeCustomerId: string | undefined | null
  intent: CashfreeOrderIntentRow | null
}): ResolvePaymentNoteResult {
  const { clerkId, orderId, rawOrderNote, cashfreeCustomerId, intent } = input
  const parsed = parseOrderNote(rawOrderNote)
  const normalizedPreview = rawOrderNote
    ? rawOrderNote.slice(0, 80) + (rawOrderNote.length > 80 ? '…' : '')
    : null

  const details: Record<string, unknown> = {
    orderId,
    sessionClerkId: clerkId,
    cashfreeCustomerId: cashfreeCustomerId ?? null,
    hasParsedOrderNote: Boolean(parsed),
    hasIntent: Boolean(intent),
    rawOrderNotePreview: normalizedPreview,
  }

  if (cashfreeCustomerId && cashfreeCustomerId !== clerkId) {
    return {
      ok: false,
      code: 'cashfree_customer_mismatch',
      message:
        'This payment belongs to a different account. Sign in with the same account you used when you started checkout.',
      details: { ...details, cashfreeCustomerId },
    }
  }

  if (intent && intent.clerk_id !== clerkId) {
    return {
      ok: false,
      code: 'intent_clerk_mismatch',
      message:
        'This order was started under a different account. Sign in with the account that began checkout, then try again.',
      details: { ...details, intentClerkId: intent.clerk_id },
    }
  }

  if (parsed && parsed.clerkId !== clerkId) {
    return {
      ok: false,
      code: 'order_note_clerk_mismatch',
      message:
        'This payment is linked to another user. Sign in with the account that created the order.',
      details: { ...details, orderNoteClerkId: parsed.clerkId },
    }
  }

  if (parsed && intent) {
    if (
      parsed.clerkId !== intent.clerk_id ||
      parsed.classId !== intent.class_id ||
      parsed.purpose !== intent.purpose
    ) {
      return {
        ok: false,
        code: 'order_metadata_conflict',
        message: 'Order details could not be verified. Contact support with your order id.',
        details: {
          ...details,
          parsedClassId: parsed.classId,
          intentClassId: intent.class_id,
        },
      }
    }
  }

  if (parsed && cashfreeCustomerId && parsed.clerkId !== cashfreeCustomerId) {
    return {
      ok: false,
      code: 'cashfree_note_customer_conflict',
      message: 'Payment metadata from Cashfree is inconsistent. Contact support with your order id.',
      details,
    }
  }

  if (parsed) {
    return { ok: true, note: parsed, source: intent ? 'both' : 'order_note' }
  }

  if (intent) {
    if (!cashfreeCustomerId) {
      return {
        ok: false,
        code: 'missing_cashfree_customer',
        message: 'Could not verify this payment with Cashfree. Try again in a moment.',
        details,
      }
    }
    return { ok: true, note: paymentNoteFromIntent(intent), source: 'intent' }
  }

  return {
    ok: false,
    code: 'order_note_unreadable',
    message:
      'We could not read order details for this payment. Try again or contact support with your order id.',
    details,
  }
}

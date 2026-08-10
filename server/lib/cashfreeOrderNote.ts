export type PaymentOrderNote = {
  v: 1
  clerkId: string
  classId: string
  purpose: 'paid' | 'trial'
  planTier?: 'monthly' | 'three-month'
}

/** Cashfree GET order sometimes returns order_note as HTML-entity–encoded JSON. */
export function normalizeCashfreeOrderNoteRaw(raw: string | undefined | null): string {
  if (!raw?.trim()) return ''
  let s = raw.trim()
  if (!/&(?:quot|#34|#x22|amp|lt|gt);/i.test(s)) return s

  return s
    .replace(/&quot;/gi, '"')
    .replace(/&#0*34;/g, '"')
    .replace(/&#x0*22;/gi, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export function parseOrderNote(raw: string | undefined | null): PaymentOrderNote | null {
  const normalized = normalizeCashfreeOrderNoteRaw(raw)
  if (!normalized) return null
  try {
    const parsed = JSON.parse(normalized) as PaymentOrderNote
    if (parsed.v !== 1 || !parsed.clerkId || !parsed.classId || !parsed.purpose) return null
    if (parsed.purpose !== 'paid' && parsed.purpose !== 'trial') return null
    return parsed
  } catch {
    return null
  }
}

export function paymentNoteFromIntent(intent: {
  clerk_id: string
  class_id: string
  purpose: 'paid' | 'trial'
  plan_tier?: 'monthly' | 'three-month' | null
}): PaymentOrderNote {
  return {
    v: 1,
    clerkId: intent.clerk_id,
    classId: intent.class_id,
    purpose: intent.purpose,
    planTier: intent.purpose === 'paid' ? intent.plan_tier ?? 'monthly' : undefined,
  }
}

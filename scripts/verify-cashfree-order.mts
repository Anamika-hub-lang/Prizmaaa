/**
 * Verifies Cashfree order_note parsing and applies enrollment for a paid order (service role).
 * Usage: npx tsx scripts/verify-cashfree-order.mts edu_1785736035701
 */
import { readFileSync } from 'node:fs'
import { cashfreeFetchOrder } from '../vite/lib/cashfreeServer.ts'
import { parseOrderNote } from '../vite/lib/cashfreeOrderNote.ts'
import {
  getCashfreeOrderIntent,
  resolvePaymentEnrollmentNote,
} from '../vite/lib/cashfreeOrderIntent.ts'
import { upsertEnrollmentAfterPayment } from '../vite/lib/enrollmentAdmin.ts'
import { createClient } from '@supabase/supabase-js'
import { TRIAL_DAYS } from '../vite/lib/pricingServer.ts'

const orderId = process.argv[2] ?? 'edu_1785736035701'

const envText = readFileSync('.env', 'utf8')
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const cfg = {
  clientId: env.CASHFREE_CLIENT_ID,
  clientSecret: env.CASHFREE_CLIENT_SECRET,
  mode: env.CASHFREE_MODE === 'production' ? 'production' : 'sandbox',
} as const

const clerkId = 'user_3HLKR4iZMvGYpXF9nftGeyu4LCo'

const order = await cashfreeFetchOrder(cfg, orderId)
const parsed = parseOrderNote(order.orderNoteRaw ?? order.orderNote)

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const intent = await getCashfreeOrderIntent(supabase, orderId).catch(() => null)

const resolved = resolvePaymentEnrollmentNote({
  clerkId,
  orderId,
  rawOrderNote: order.orderNoteRaw ?? order.orderNote,
  cashfreeCustomerId: order.customerId,
  intent,
})

console.log('--- Cashfree fetch ---')
console.log(JSON.stringify({ orderStatus: order.orderStatus, customerId: order.customerId, parsed }, null, 2))
console.log('--- Resolve ---')
console.log(JSON.stringify(resolved, null, 2))

if (!resolved.ok) {
  console.error('Cannot enroll:', resolved.message)
  process.exit(1)
}

await upsertEnrollmentAfterPayment(supabase, resolved.note, `Cashfree · ${orderId}`, TRIAL_DAYS)

const { data: row } = await supabase
  .from('student_enrollments')
  .select('id, clerk_id, class_id, status, billing_status, plan_tier')
  .eq('clerk_id', clerkId)
  .eq('class_id', resolved.note.classId)
  .maybeSingle()

console.log('--- Enrollment after upsert ---')
console.log(JSON.stringify(row, null, 2))

if (row?.status === 'ongoing' && row?.billing_status === 'trial') {
  console.log('OK: enrollment active for dashboard')
} else {
  console.error('Unexpected enrollment state')
  process.exit(1)
}

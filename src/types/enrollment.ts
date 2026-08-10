export type BillingStatus = 'trial' | 'active' | 'cancelled'
export type PaymentMethodType = 'upi' | 'bank' | 'card'

export type StudentEnrollment = {
  id: string
  clerkId: string
  classId: string | null
  freeCourseId: string | null
  kind: 'online' | 'free'
  progress: number
  status: 'ongoing' | 'completed' | 'draft'
  planTier: string | null
  enrolledAt: string
  billingStatus: BillingStatus | null
  trialEndsAt: string | null
  paymentMethodType: PaymentMethodType | null
  paymentMethodLabel: string | null
  autoRenew: boolean
}

export type EnrollmentRow = {
  id: string
  clerk_id: string
  class_id: string | null
  free_course_id: string | null
  kind: 'online' | 'free'
  progress: number
  status: 'ongoing' | 'completed' | 'draft'
  plan_tier: string | null
  enrolled_at: string
  billing_status?: BillingStatus | null
  trial_ends_at?: string | null
  payment_method_type?: PaymentMethodType | null
  payment_method_label?: string | null
  auto_renew?: boolean
}

export function enrollmentFromRow(row: EnrollmentRow): StudentEnrollment {
  return {
    id: row.id,
    clerkId: row.clerk_id,
    classId: row.class_id,
    freeCourseId: row.free_course_id,
    kind: row.kind,
    progress: row.progress,
    status: row.status,
    planTier: row.plan_tier,
    enrolledAt: row.enrolled_at,
    billingStatus: row.billing_status ?? null,
    trialEndsAt: row.trial_ends_at ?? null,
    paymentMethodType: row.payment_method_type ?? null,
    paymentMethodLabel: row.payment_method_label ?? null,
    autoRenew: row.auto_renew ?? true,
  }
}

import type { StudentEnrollment } from '../types/enrollment'

export function isActiveClassEnrollment(e: StudentEnrollment): boolean {
  if (e.kind !== 'online' || !e.classId) return false
  if (e.billingStatus === 'cancelled' || e.status === 'draft') return false
  if (e.billingStatus === 'trial' || e.billingStatus === 'active') return true
  if (e.status === 'ongoing') return true
  return false
}

export function getActiveEnrollmentForClass(
  enrollments: StudentEnrollment[],
  classId: string,
): StudentEnrollment | undefined {
  return enrollments.find((e) => e.classId === classId && isActiveClassEnrollment(e))
}

export function planTierLabel(tier: string | null | undefined): string {
  if (tier === 'trial') return 'Starter trial'
  if (tier === 'monthly') return 'Growth (monthly)'
  if (tier === 'three-month') return 'Premium (3 months)'
  return 'your current plan'
}

export function enrollmentBlockedMessage(enrollment: StudentEnrollment): string {
  return `You are already enrolled on ${planTierLabel(enrollment.planTier)} for this class. Cancel from your dashboard first, then you can pick a different plan.`
}

export function assertCanEnrollInClass(enrollments: StudentEnrollment[], classId: string): void {
  const active = getActiveEnrollmentForClass(enrollments, classId)
  if (active) throw new Error(enrollmentBlockedMessage(active))
}

/** Server row shape from Supabase select */
export function isActiveEnrollmentRow(row: {
  billing_status?: string | null
  status?: string | null
}): boolean {
  if (row.billing_status === 'cancelled' || row.status === 'draft') return false
  if (row.billing_status === 'trial' || row.billing_status === 'active') return true
  if (row.status === 'ongoing') return true
  return false
}

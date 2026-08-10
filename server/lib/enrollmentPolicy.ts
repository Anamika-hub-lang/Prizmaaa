export function isActiveEnrollmentRow(row: {
  billing_status?: string | null
  status?: string | null
}): boolean {
  if (row.billing_status === 'cancelled' || row.status === 'draft') return false
  if (row.billing_status === 'trial' || row.billing_status === 'active') return true
  if (row.status === 'ongoing') return true
  return false
}

export function activeEnrollmentBlockedMessage(planTier: string | null | undefined): string {
  const label =
    planTier === 'trial'
      ? 'Starter trial'
      : planTier === 'monthly'
        ? 'Growth (monthly)'
        : planTier === 'three-month'
          ? 'Premium (3 months)'
          : 'your current plan'
  return `Already enrolled on ${label} for this class. Cancel from dashboard first, then choose a new plan.`
}

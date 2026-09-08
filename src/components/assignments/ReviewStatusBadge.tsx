import { StatusBadge, type StatusTone } from '../ui/StatusBadge'
import type { AssignmentReviewStatus } from '../../types/mentorContent'

function reviewTone(status: AssignmentReviewStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case 'approved':
      return { label: 'Approved', tone: 'approved' }
    case 'rejected':
      return { label: 'Rejected', tone: 'rejected' }
    case 'pending':
      return { label: 'Awaiting review', tone: 'pending' }
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

export function ReviewStatusBadge({ status }: { status: AssignmentReviewStatus }) {
  const { label, tone } = reviewTone(status)
  return <StatusBadge label={label} tone={tone} />
}

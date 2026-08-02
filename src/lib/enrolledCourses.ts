import type { EnrolledCourse } from '../components/student/MyCourseCard'
import type { ManagedClass } from '../types/mentorContent'
import type { FreeCourse } from '../data/classCatalog'
import type { StudentEnrollment } from '../types/enrollment'
import { daysUntilTrialEnd } from './enrollmentBilling'

const categoryLabels: Record<string, string> = {
  skills: 'Skills Based',
  academic: 'Academic',
  professional: 'Professional',
}

export function enrollmentToEnrolledCourse(
  enrollment: StudentEnrollment,
  classItem?: ManagedClass,
  freeItem?: FreeCourse,
): EnrolledCourse | null {
  if (enrollment.kind === 'online' && classItem) {
    const daysLeft = daysUntilTrialEnd(enrollment.trialEndsAt)
    return {
      id: classItem.id,
      enrollmentId: enrollment.id,
      image: classItem.image,
      title: classItem.title,
      mentor: classItem.mentor,
      mentorImage: classItem.mentorImage,
      progress: enrollment.progress,
      status: enrollment.status,
      nextSession: classItem.nextSessionLabel
        ? `${classItem.nextSessionLabel} · Google Meet`
        : undefined,
      category: categoryLabels[classItem.categoryId] ?? classItem.categoryId,
      type: 'online',
      billingStatus: enrollment.billingStatus,
      planTier: enrollment.planTier,
      trialEndsAt: enrollment.trialEndsAt,
      trialDaysLeft: enrollment.billingStatus === 'trial' ? daysLeft : null,
      paymentLabel: enrollment.paymentMethodLabel,
    }
  }

  if (enrollment.kind === 'free' && freeItem) {
    return {
      id: freeItem.id,
      enrollmentId: enrollment.id,
      image: freeItem.image,
      title: freeItem.title,
      mentor: freeItem.instructor,
      mentorImage: freeItem.image,
      progress: enrollment.progress,
      status: enrollment.status,
      category: 'Free course',
      type: 'free',
      billingStatus: enrollment.billingStatus,
    }
  }

  return null
}

export function daysSinceFirstEnrollment(enrollments: StudentEnrollment[]): number {
  if (enrollments.length === 0) return 0
  const earliest = enrollments.reduce((min, e) => {
    const t = new Date(e.enrolledAt).getTime()
    return t < min ? t : min
  }, Date.now())
  const days = Math.floor((Date.now() - earliest) / 86400000) + 1
  return Math.max(0, days)
}

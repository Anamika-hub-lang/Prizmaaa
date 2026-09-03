import { Video, MessageCircle, Calendar } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router-dom'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { AppButton } from '../../components/ui/AppButton'
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper'
import { useMentorContent } from '../../context/MentorContentContext'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'
import { useStudentEnrollments } from '../../hooks/useStudentEnrollments'
import { getActiveEnrollmentForClass } from '../../lib/classEnrollmentPolicy'
import { MentorAvatar } from '../../components/ui/MentorAvatar'
import { useLiveMeetSession } from '../../components/student/LiveMeetSession'
import { formatSessionLabel } from '../../lib/sessionSchedule'

export function StudentEnrolledPage() {
  const { classId } = useParams()
  const [searchParams] = useSearchParams()
  const planTier = searchParams.get('plan') ?? undefined
  const { getClassById } = useMentorContent()
  const { enrollments } = useStudentEnrollments()
  const { joinMeet, startingClassId } = useLiveMeetSession()
  const item = classId ? getClassById(classId) : undefined
  const activeEnrollment = classId ? getActiveEnrollmentForClass(enrollments, classId) : undefined
  const enrolled = Boolean(activeEnrollment)

  if (!item) {
    return (
      <div className="p-8 text-center">
        <AppButton to="/student/browse">Browse classes</AppButton>
      </div>
    )
  }

  const joining = startingClassId === item.id
  const nextLabel =
    item.nextSessionLabel?.trim() && item.nextSessionLabel !== 'Set in Meet tab'
      ? formatSessionLabel(item.nextSessionLabel)
      : 'Schedule coming soon'

  return (
    <>
      <StudentPageHeader
        title="Step 3 — You're enrolled!"
        subtitle={
          enrolled
            ? `Payment complete for ${item.title}. This class is on your dashboard.`
            : `Complete checkout to enroll in ${item.title}.`
        }
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
        <CheckoutStepper current={3} path="paid" />

        {!enrolled && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No active enrollment found. Go back to checkout and complete payment.
            <AppButton to={`/student/checkout/${item.id}`} className="mt-3" size="sm">
              Back to checkout
            </AppButton>
          </div>
        )}

        <div className={`${tintedSurfaceKey(item.id)} p-6 flex gap-4 items-center`}>
          <MentorAvatar src={item.mentorImage} name={item.mentor} size="xl" />
          <div>
            <p className="text-xs text-educture-orange font-bold uppercase tracking-wide">Your mentor</p>
            <p className="font-bold text-lg">{item.mentor}</p>
            {planTier && (
              <p className="text-xs text-gray-500 mt-1 capitalize">Plan: {planTier.replace('-', ' ')}</p>
            )}
            <AppButton size="sm" variant="outline" className="mt-2">
              <MessageCircle className="w-4 h-4" /> Message mentor
            </AppButton>
          </div>
        </div>

        <div className={`${tintedSurface(1)} p-6`}>
          <div className="flex items-center gap-3 mb-3 text-[#1d1d1d]">
            <Video className="w-7 h-7 text-educture-orange" />
            <p className="font-bold text-lg">Join on Google Meet</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Your first live session link is ready. Classes are taught live on Google Meet — open the link at
            session time from your phone or laptop.
          </p>
          {enrolled ? (
            <button
              type="button"
              disabled={joining}
              onClick={() =>
                void joinMeet({
                  classId: item.id,
                  meetLink: item.meetLink,
                  classTitle: item.title,
                  sessionLabel: item.nextSessionLabel,
                })
              }
              className="inline-flex items-center justify-center w-full py-3 rounded-full bg-educture-orange text-white font-bold text-sm hover:bg-educture-orange-dark transition-colors border-2 border-orange-300 disabled:opacity-60"
            >
              {joining ? 'Starting…' : 'Open Google Meet link'}
            </button>
          ) : (
            <AppButton to={`/student/checkout/${item.id}`} className="w-full justify-center">
              Complete enrollment first
            </AppButton>
          )}
          <p className="text-xs text-gray-600 mt-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-educture-orange" /> Next session: {nextLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <AppButton to="/student">Go to Dashboard</AppButton>
          <AppButton to="/student/calendar" variant="outline">
            View calendar
          </AppButton>
        </div>
      </main>
    </>
  )
}

import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, Video, CreditCard, Users } from 'lucide-react'
import { StudentPageHeader, EnrollmentSteps } from '../../components/layout/StudentLayout'
import { AppButton } from '../../components/ui/AppButton'
import { useMentorContent } from '../../context/MentorContentContext'
import { useStudentEnrollments } from '../../hooks/useStudentEnrollments'
import { getActiveEnrollmentForClass } from '../../lib/classEnrollmentPolicy'
import { ActiveEnrollmentBlock } from '../../components/checkout/ActiveEnrollmentBlock'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'
import { categoryPricing, formatInr, TRIAL_DAYS } from '../../data/pricingPlans'

export function StudentClassDetailPage() {
  const { classId } = useParams()
  const { getClassById } = useMentorContent()
  const { enrollments } = useStudentEnrollments()
  const item = classId ? getClassById(classId) : undefined
  const activeEnrollment = classId ? getActiveEnrollmentForClass(enrollments, classId) : undefined

  if (!item) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Class not found.</p>
        <AppButton to="/student/browse" className="mt-4">Back to browse</AppButton>
      </div>
    )
  }

  const plans = categoryPricing[item.categoryId]

  return (
    <>
      <StudentPageHeader title={item.title} subtitle={item.description} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8 text-left">
        <div className="lg:col-span-2 space-y-6">
          <img src={item.image} alt="" className="w-full rounded-2xl shadow-card object-cover aspect-video" />

          <div className={`${tintedSurface(0)} p-6`}>
            <h2 className="font-bold text-lg mb-4">How it works</h2>
            <EnrollmentSteps />
          </div>

          <div className={`${tintedSurface(1)} p-6`}>
            <div className="flex items-start gap-3">
              <Video className="w-6 h-6 text-educture-orange shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#1d1d1d]">Live on Google Meet</p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  After payment, your mentor shares the Google Meet link for every live session. Join from
                  your calendar or the &quot;My Courses&quot; dashboard — camera on optional, chat open for questions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className={`${tintedSurfaceKey(item.id)} p-6 sticky top-24`}>
            <p className="text-lg font-bold text-[#1d1d1d]">Official plans</p>
            <p className="text-2xl font-bold text-educture-orange mt-2">
              {formatInr(plans.monthlyInr)}
              <span className="text-sm font-semibold text-gray-600"> / month (Growth)</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Premium {formatInr(plans.threeMonthInr)} / 3 months · Starter {TRIAL_DAYS}-day trial at checkout
            </p>
            <p className="text-xs text-educture-orange font-semibold mt-2">No per-class one-time fee</p>

            <div className="flex items-center gap-3 mt-6 pb-6 border-b border-gray-100">
              <img src={item.mentorImage} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-sm flex items-center gap-1">
                  {item.mentor}
                  <BadgeCheck className="w-4 h-4 text-educture-orange" />
                </p>
                <p className="text-xs text-gray-500">Your mentor after enroll</p>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-gray-600 my-6">
              <li className="flex gap-2"><Users className="w-4 h-4 text-educture-orange shrink-0" /> {item.sessions}</li>
              <li className="flex gap-2"><Video className="w-4 h-4 text-educture-orange shrink-0" /> Google Meet live</li>
              <li className="flex gap-2"><CreditCard className="w-4 h-4 text-educture-orange shrink-0" /> Starter · Growth · Premium at checkout</li>
            </ul>

            {activeEnrollment ? (
              <div className="mt-4">
                <ActiveEnrollmentBlock enrollment={activeEnrollment} />
              </div>
            ) : (
              <AppButton to={`/student/checkout/${item.id}`} className="w-full justify-center mt-4" size="lg">
                Choose plan & pay
              </AppButton>
            )}
            <Link
              to="/student/browse"
              className="block text-center text-sm text-gray-500 mt-4 hover:text-educture-orange"
            >
              ← Back to categories
            </Link>
          </div>
        </aside>
      </main>
    </>
  )
}

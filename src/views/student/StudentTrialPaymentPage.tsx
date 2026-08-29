import { Link, useParams } from 'react-router-dom'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { AppButton } from '../../components/ui/AppButton'
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper'
import { PaymentMethodForm } from '../../components/checkout/PaymentMethodForm'
import { CashfreePayButton } from '../../components/checkout/CashfreePayButton'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'
import { useMentorContent } from '../../context/MentorContentContext'
import { useStudentEnrollments } from '../../hooks/useStudentEnrollments'
import { ActiveEnrollmentBlock } from '../../components/checkout/ActiveEnrollmentBlock'
import { getActiveEnrollmentForClass } from '../../lib/classEnrollmentPolicy'
import { isCashfreeClientEnabled } from '../../lib/cashfreeCheckout'
import { TRIAL_DAYS, categoryPricing } from '../../data/pricingPlans'
import type { PaymentMethodType } from '../../types/enrollment'
import { useState } from 'react'

const TRIAL_VERIFY_INR = 1

export function StudentTrialPaymentPage() {
  const { classId } = useParams()
  const { getClassById } = useMentorContent()
  const { startTrialWithPayment, enrollments } = useStudentEnrollments()
  const cashfreeOn = isCashfreeClientEnabled()
  const item = classId ? getClassById(classId) : undefined
  const activeEnrollment = classId ? getActiveEnrollmentForClass(enrollments, classId) : undefined

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!item) {
    return (
      <>
        <StudentPageHeader title="Class not found" subtitle="This class may have been removed." />
        <main className="max-w-lg mx-auto px-4 py-12 text-center">
          <AppButton to="/student/classes" variant="outline">Browse classes</AppButton>
        </main>
      </>
    )
  }

  const monthly = categoryPricing[item.categoryId].monthlyInr
  const enrollClassId = item.id

  async function handleSubmit(type: PaymentMethodType, raw: string) {
    setError(null)
    setSaving(true)
    try {
      await startTrialWithPayment(enrollClassId, type, raw)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start trial')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <StudentPageHeader
        title="Start trial"
        subtitle={item.title}
      />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <CheckoutStepper current={2} path="trial" />

        <div className={`${tintedSurfaceKey(item.id)} p-5 mb-6 text-left`}>
          <p className="text-xs font-bold uppercase text-sky-600">Starter plan</p>
          <p className="font-bold mt-1">{item.title}</p>
          <p className="text-sm text-gray-600 mt-1">{TRIAL_DAYS} days free</p>
        </div>

        <div className={`${tintedSurface(1)} p-6`}>
          {activeEnrollment ? (
            <ActiveEnrollmentBlock enrollment={activeEnrollment} />
          ) : cashfreeOn ? (
            <>
              <CashfreePayButton
                classId={item.id}
                purpose="trial"
                label={`Pay ₹${TRIAL_VERIFY_INR} & start trial`}
              />
            </>
          ) : (
            <>
              <PaymentMethodForm
                submitLabel={`Start ${TRIAL_DAYS}-day trial → dashboard`}
                saving={saving}
                note={`We store only a masked label. After ${TRIAL_DAYS} days, ₹${monthly.toLocaleString('en-IN')} is charged automatically unless you cancel from your dashboard before the trial ends.`}
                onSubmit={handleSubmit}
              />
              {error && (
                <p className="text-sm text-red-600 mt-3" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        <p className="text-center mt-6">
          <Link to={`/student/checkout/${item.id}`} className="text-sm text-sky-600 hover:underline">
            ← Back to plan selection
          </Link>
        </p>
      </main>
    </>
  )
}

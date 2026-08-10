import { useState, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { AppButton } from '../../components/ui/AppButton'
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper'
import { PaymentMethodForm } from '../../components/checkout/PaymentMethodForm'
import { CashfreePayButton } from '../../components/checkout/CashfreePayButton'
import { isCashfreeClientEnabled } from '../../lib/cashfreeCheckout'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'
import { useMentorContent } from '../../context/MentorContentContext'
import { useStudentEnrollments } from '../../hooks/useStudentEnrollments'
import { CategoryPlanCards } from '../../components/pricing/CategoryPlanCards'
import { ActiveEnrollmentBlock } from '../../components/checkout/ActiveEnrollmentBlock'
import { getActiveEnrollmentForClass } from '../../lib/classEnrollmentPolicy'
import {
  categoryPricing,
  getPaymentAmount,
  getPaymentLabel,
  TRIAL_DAYS,
  type PricingPaymentTier,
} from '../../data/pricingPlans'

function isPaymentTier(value: string | null): value is PricingPaymentTier {
  return value === 'monthly' || value === 'three-month'
}

export function StudentCheckoutPage() {
  const { classId } = useParams()
  const [searchParams] = useSearchParams()
  const { getClassById } = useMentorContent()
  const { enrollWithPaidPlan, enrollments } = useStudentEnrollments()
  const cashfreeOn = isCashfreeClientEnabled()
  const item = classId ? getClassById(classId) : undefined
  const activeEnrollment = classId ? getActiveEnrollmentForClass(enrollments, classId) : undefined

  const tierFromUrl = searchParams.get('plan')
  const initialTier = isPaymentTier(tierFromUrl) ? tierFromUrl : null

  const [selectedTier, setSelectedTier] = useState<PricingPaymentTier | null>(initialTier)
  const [saving, setSaving] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const step: 'choose' | 'pay' = selectedTier ? 'pay' : 'choose'

  const paymentSelection = useMemo(() => {
    if (!item || !selectedTier) return null
    return { categoryId: item.categoryId, tier: selectedTier }
  }, [item, selectedTier])

  if (!item) {
    return (
      <div className="p-8 text-center">
        <AppButton to="/student/browse">Back to browse</AppButton>
      </div>
    )
  }

  const categoryTitle = categoryPricing[item.categoryId].title

  if (step === 'choose') {
    return (
      <>
        <StudentPageHeader
          title="Choose your plan"
          subtitle={`${item.title} · ${categoryTitle} — Starter trial or pay now (Growth / Premium).`}
        />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <CheckoutStepper current={1} path="paid" />
          {activeEnrollment && (
            <div className="mb-8">
              <ActiveEnrollmentBlock enrollment={activeEnrollment} />
            </div>
          )}

          <div className={`${tintedSurfaceKey(item.id)} p-4 sm:p-5 mb-8 flex gap-4 items-center text-left`}>
            <img src={item.image} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div>
              <p className="font-bold text-[#1d1d1d]">{item.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">Mentor: {item.mentor}</p>
              <p className="text-xs text-educture-orange font-semibold mt-1 capitalize">{item.categoryId} track</p>
            </div>
          </div>

          {!activeEnrollment && (
            <CategoryPlanCards
              categoryId={item.categoryId}
              mode="checkout"
              classId={item.id}
              onSelectPay={(tier) => setSelectedTier(tier)}
            />
          )}

          <p className="text-center mt-8 text-sm text-gray-500">
            Starter trial? Use the blue <strong>Start free trial</strong> card — payment method only, no charge for{' '}
            {TRIAL_DAYS} days.
          </p>
          <p className="text-center mt-4">
            <Link to={`/student/class/${item.id}`} className="text-sm text-gray-500 hover:text-educture-orange">
              ← Back to class details
            </Link>
          </p>
        </main>
      </>
    )
  }

  if (step === 'pay' && activeEnrollment) {
    return (
      <>
        <StudentPageHeader title="Choose your plan" subtitle={item.title} />
        <main className="max-w-lg mx-auto px-4 py-8">
          <ActiveEnrollmentBlock enrollment={activeEnrollment} />
        </main>
      </>
    )
  }

  const amount = paymentSelection ? getPaymentAmount(paymentSelection) : 0
  const planLabel = paymentSelection ? getPaymentLabel(paymentSelection) : ''
  const tier = selectedTier as 'monthly' | 'three-month'

  async function handlePaidSubmit(type: import('../../types/enrollment').PaymentMethodType, raw: string) {
    if (!classId || !selectedTier) return
    setPayError(null)
    setSaving(true)
    try {
      await enrollWithPaidPlan(classId, tier, type, raw)
      window.location.assign(`/student/enrolled/${classId}?plan=${selectedTier}`)
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Payment could not be completed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <StudentPageHeader
        title="Step 2 — Complete payment"
        subtitle={`${planLabel} for ${item.title}. After success, this class appears on your dashboard.`}
      />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <CheckoutStepper current={2} path="paid" />

        <div className={`${tintedSurfaceKey(item.id)} overflow-hidden mb-6`}>
          <img src={item.image} alt="" className="w-full h-40 object-cover" />
          <div className="p-5 text-left">
            <p className="font-bold text-lg">{item.title}</p>
            <p className="text-sm text-gray-500 mt-1">{planLabel}</p>
            <p className="text-2xl font-bold text-educture-orange mt-4">₹{amount.toLocaleString('en-IN')}</p>
            {tier === 'monthly' && (
              <p className="text-xs text-gray-500 mt-1">1 month access · renews monthly</p>
            )}
            {tier === 'three-month' && (
              <p className="text-xs text-gray-500 mt-1">One payment · 3 months of live classes</p>
            )}
            {cashfreeOn && (
              <p className="text-xs text-sky-700 font-semibold mt-2">Secured by Cashfree Payments</p>
            )}
          </div>
        </div>

        <div className={`${tintedSurface(2)} p-6`}>
          {cashfreeOn ? (
            <>
              <CashfreePayButton
                classId={item.id}
                purpose="paid"
                planTier={tier}
                label={`Pay ₹${amount.toLocaleString('en-IN')} with Cashfree`}
              />
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                You will be redirected to Cashfree checkout (UPI, cards, net banking). After payment, your class
                unlocks on the dashboard.
              </p>
            </>
          ) : (
            <>
              <PaymentMethodForm
                submitLabel={`Pay ₹${amount.toLocaleString('en-IN')} & enroll`}
                saving={saving}
                note="Demo checkout — enable Cashfree in .env for real payments."
                onSubmit={handlePaidSubmit}
              />
              {payError && (
                <p className="text-sm text-red-600 mt-3" role="alert">
                  {payError}
                </p>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => setSelectedTier(null)}
            className="block w-full text-center text-sm text-gray-500 hover:text-educture-orange mt-4"
          >
            ← Change plan
          </button>
          <Link
            to={`/student/class/${item.id}`}
            className="block text-center text-sm text-gray-400 hover:text-educture-orange mt-2"
          >
            Back to class details
          </Link>
        </div>
      </main>
    </>
  )
}

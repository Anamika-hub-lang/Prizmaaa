import { TRIAL_DAYS } from '../../data/pricingPlans'

/** Where pricing / payment cards appear and what happens next (student journey). */
export function PaymentFlowGuide({ context }: { context: 'checkout' | 'marketing' | 'class-detail' }) {
  if (context === 'class-detail') {
    return (
      <div className="rounded-2xl border-2 border-orange-100 bg-[#fff9f3] p-4 text-sm text-gray-700 space-y-2 text-left">
        <p className="font-bold text-[#1d1d1d]">Payment flow</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-600">
          <li>Click <strong>Choose plan & pay</strong> — three plan cards appear.</li>
          <li>
            <strong>Starter</strong> → save UPI/bank/card → {TRIAL_DAYS}-day trial on dashboard (no charge today).
          </li>
          <li>
            <strong>Growth / Premium</strong> → pay now → class shows on dashboard immediately.
          </li>
        </ol>
      </div>
    )
  }

  if (context === 'marketing') {
    return (
      <div className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4 text-sm text-gray-700 text-left mb-8">
        <p className="font-bold text-[#1d1d1d] mb-2">How payment works on Educture</p>
        <ul className="space-y-1.5 text-gray-600">
          <li>
            <strong>Starter trial</strong> — sign up, browse a live class, then add a payment method to start{' '}
            {TRIAL_DAYS} days free.
          </li>
          <li>
            <strong>Growth / Premium</strong> — sign in, browse classes, open a class, then pay at checkout.
          </li>
          <li>Your enrolled classes always appear on the student <strong>Dashboard</strong> after trial or payment.</li>
        </ul>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 sm:p-5 text-sm text-gray-700 text-left mb-8">
      <p className="font-bold text-[#1d1d1d] mb-2">Step 1 — pick one card</p>
      <ul className="space-y-2">
        <li>
          <span className="font-semibold text-sky-700">Starter</span> — next: payment method only (trial starts, no
          charge today).
        </li>
        <li>
          <span className="font-semibold text-educture-orange">Growth</span> — next: pay 1 month on step 2.
        </li>
        <li>
          <span className="font-semibold text-violet-700">Premium</span> — next: pay 3-month bundle on step 2.
        </li>
      </ul>
    </div>
  )
}

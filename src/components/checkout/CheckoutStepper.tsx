import { checkoutSteps } from '../../data/paymentFlow'

export function CheckoutStepper({
  current,
  path,
}: {
  current: 1 | 2 | 3
  path: 'trial' | 'paid'
}) {
  const steps =
    path === 'trial'
      ? [
          { n: 1, label: 'Choose Starter trial' },
          { n: 2, label: 'Save payment method' },
          { n: 3, label: 'Trial on dashboard' },
        ]
      : [
          { n: checkoutSteps.choose.n, label: checkoutSteps.choose.label },
          { n: checkoutSteps.pay.n, label: checkoutSteps.pay.label },
          { n: checkoutSteps.dashboard.n, label: checkoutSteps.dashboard.label },
        ]

  return (
    <ol className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-8 text-left">
      {steps.map((s) => {
        const active = s.n === current
        const done = s.n < current
        return (
          <li
            key={s.n}
            className={`flex items-center gap-3 flex-1 rounded-2xl border-2 px-4 py-3 ${
              active
                ? 'border-educture-orange bg-orange-50'
                : done
                  ? 'border-emerald-200 bg-emerald-50/80'
                  : 'border-gray-100 bg-white'
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                active
                  ? 'bg-educture-orange text-white'
                  : done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {s.n}
            </span>
            <span className={`text-sm font-semibold ${active ? 'text-[#1d1d1d]' : 'text-gray-600'}`}>
              {s.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

import { useState } from 'react'
import { Check, Copy, Smartphone } from 'lucide-react'
import { UPI_ID, UPI_PAYEE_NAME, UPI_QR_IMAGE } from '../../data/upiPayment'

type Props = {
  amountInr: number
  title?: string
  subtitle?: string
  confirmLabel?: string
  saving?: boolean
  onConfirmPaid?: () => void | Promise<void>
}

export function UpiQrPaymentPanel({
  amountInr,
  title,
  subtitle,
  confirmLabel = "I've completed payment",
  saving = false,
  onConfirmPaid,
}: Props) {
  const [copied, setCopied] = useState(false)

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(UPI_ID)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-5 text-left">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-educture-orange">Pay via UPI</p>
        {title && <p className="font-bold text-[#1d1d1d] mt-2">{title}</p>}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        <p className="font-display text-3xl text-educture-orange mt-3">₹{amountInr.toLocaleString('en-IN')}</p>
      </div>

      <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mx-auto max-w-[240px]">
          <img
            src={UPI_QR_IMAGE}
            alt={`UPI QR code for ${UPI_PAYEE_NAME}`}
            className="w-full rounded-xl border border-gray-100"
          />
        </div>
        <p className="text-center text-sm font-semibold text-[#1d1d1d] mt-4">{UPI_PAYEE_NAME}</p>
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <code className="text-sm font-mono bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            {UPI_ID}
          </code>
          <button
            type="button"
            onClick={() => void copyUpiId()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-educture-orange hover:underline"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy UPI ID'}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-sky-50 border border-sky-100 px-4 py-3 text-sm text-gray-700 leading-relaxed flex gap-2">
        <Smartphone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p>
          Open Paytm, PhonePe, Google Pay, or any UPI app → Scan this QR → Pay{' '}
          <strong>₹{amountInr.toLocaleString('en-IN')}</strong> exactly.
        </p>
      </div>

      {onConfirmPaid && (
        <button
          type="button"
          disabled={saving}
          onClick={() => void onConfirmPaid()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark disabled:opacity-60 transition-colors shadow-[0_8px_24px_rgba(243,112,33,0.35)]"
        >
          {saving ? 'Submitting…' : confirmLabel}
        </button>
      )}

      <p className="text-xs text-gray-500 text-center leading-relaxed">
        After paying, tap the button above so we can verify and confirm your booking.
      </p>
    </div>
  )
}

import { useState } from 'react'
import type { PaymentMethodType } from '../../types/enrollment'

type Tab = PaymentMethodType

export function PaymentMethodForm({
  submitLabel,
  saving,
  onSubmit,
  note,
}: {
  submitLabel: string
  saving?: boolean
  note?: string
  onSubmit: (type: PaymentMethodType, raw: string) => void | Promise<void>
}) {
  const [tab, setTab] = useState<Tab>('upi')
  const [upi, setUpi] = useState('')
  const [account, setAccount] = useState('')
  const [card, setCard] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    let raw = ''
    if (tab === 'upi') raw = upi
    else if (tab === 'bank') raw = account
    else raw = card.replace(/\s/g, '')
    if (!raw.trim()) {
      setError('Please complete payment details.')
      return
    }
    await onSubmit(tab, raw.trim())
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-left">
      <p className="text-xs font-bold uppercase text-gray-500">Payment method</p>
      <div className="flex flex-wrap gap-2">
        {(['upi', 'bank', 'card'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
              tab === t
                ? 'border-educture-orange bg-educture-orange text-white'
                : 'border-orange-100 text-gray-600 hover:border-educture-orange/40'
            }`}
          >
            {t === 'upi' ? 'UPI' : t === 'bank' ? 'Bank account' : 'Debit card'}
          </button>
        ))}
      </div>

      {tab === 'upi' && (
        <input
          required
          placeholder="UPI ID (e.g. name@upi)"
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
        />
      )}
      {tab === 'bank' && (
        <input
          required
          placeholder="Account number"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
        />
      )}
      {tab === 'card' && (
        <>
          <input
            required
            placeholder="Debit card number"
            value={card}
            onChange={(e) => setCard(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
          />
          <input
            placeholder="MM/YY (optional)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
          />
        </>
      )}

      {note && <p className="text-xs text-gray-500 leading-relaxed">{note}</p>}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark disabled:opacity-60 transition-colors"
      >
        {saving ? 'Processing…' : submitLabel}
      </button>
    </form>
  )
}

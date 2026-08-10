import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { deleteAccountPermanently } from '../../lib/deleteAccount'

type DeleteAccountSectionProps = {
  email: string
}

export function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const { signOut, getToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE'

  async function handleDelete() {
    if (!canDelete) return
    setError(null)
    setDeleting(true)
    try {
      await deleteAccountPermanently(getToken)
      await signOut({ redirectUrl: '/sign-up' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete account')
      setDeleting(false)
    }
  }

  return (
    <section className="rounded-3xl border-2 border-red-200 bg-red-50/60 p-6 sm:p-8 text-left">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#1d1d1d]">Delete account permanently</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            This removes your PRIZMA account, profile, and enrollments. You can sign up again later with{' '}
            <span className="font-semibold text-gray-800">{email || 'the same email'}</span> and choose
            student or mentor during onboarding.
          </p>
        </div>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-red-300 bg-white text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete my account
        </button>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-red-800 font-medium">
            Type <strong>DELETE</strong> below to confirm. This cannot be undone.
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-4 py-3 rounded-xl border-2 border-red-200 bg-white text-sm outline-none focus:border-red-400"
            autoComplete="off"
          />
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={!canDelete || deleting}
              onClick={() => void handleDelete()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting…' : 'Permanently delete account'}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                setOpen(false)
                setConfirmText('')
                setError(null)
              }}
              className="inline-flex justify-center px-6 py-3 rounded-full border-2 border-red-200 bg-white text-sm font-semibold text-gray-700 hover:bg-red-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@clerk/nextjs'
import { UserPlus, X } from 'lucide-react'
import {
  fetchClassCoMentors,
  inviteClassCoMentor,
  removeClassCoMentor,
  type ClassCoMentor,
} from '../../lib/classCoMentorsApi'

export function ClassSharePanel({
  classId,
  classTitle,
  isOwner,
  onChanged,
}: {
  classId: string
  classTitle: string
  isOwner: boolean
  onChanged?: () => void
}) {
  const { getToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [coMentors, setCoMentors] = useState<ClassCoMentor[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchClassCoMentors(getToken, classId)
      setCoMentors(data.coMentors)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load co-mentors')
      setCoMentors([])
    } finally {
      setLoading(false)
    }
  }, [getToken, classId])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  async function invite(e: FormEvent) {
    e.preventDefault()
    if (!isOwner) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const result = await inviteClassCoMentor(getToken, classId, email)
      setMessage(result.message)
      setEmail('')
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not invite')
    } finally {
      setSaving(false)
    }
  }

  async function remove(target: ClassCoMentor) {
    if (!isOwner) return
    setSaving(true)
    setError(null)
    try {
      await removeClassCoMentor(getToken, classId, { clerkId: target.clerkId })
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove')
    } finally {
      setSaving(false)
    }
  }

  if (!isOwner && !open) {
    return (
      <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-2 py-0.5">
        Shared with you
      </span>
    )
  }

  return (
    <div className="mt-3">
      {isOwner ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {open ? 'Close share' : 'Share with co-mentor'}
        </button>
      ) : null}

      {open && isOwner ? (
        <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/50 p-3 space-y-3">
          <form onSubmit={(e) => void invite(e)} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="co-mentor@email.com"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-educture-orange"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-educture-orange px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Inviting…' : 'Invite'}
            </button>
          </form>
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          {message ? <p className="text-xs text-emerald-700">{message}</p> : null}
          {loading ? <p className="text-xs text-gray-400">Loading…</p> : null}
          {!loading && coMentors.length > 0 ? (
            <ul className="space-y-1.5">
              {coMentors.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 text-xs bg-white rounded-lg border border-orange-50 px-2.5 py-2"
                >
                  <span className="truncate text-gray-700">{m.email}</span>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void remove(m)}
                    className="text-rose-500 hover:text-rose-600 shrink-0"
                    aria-label={`Remove ${m.email}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { X } from 'lucide-react'
import type { UniversityLeadSource } from '../../data/universityLeadFields'
import {
  QUALIFICATION_OPTIONS,
  UNIVERSITY_LEAD_SOURCE_LABELS,
} from '../../data/universityLeadFields'
import { sanitizeIndianPhoneInput, validateIndianPhone } from '../../lib/phoneValidation'
import { fetchUserProfile } from '../../lib/saveProfileDetails'
import { submitUniversityLead } from '../../lib/universityLeadsApi'

const inputClass =
  'w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange'

type Props = {
  open: boolean
  source: UniversityLeadSource
  universityId: string
  universityName: string
  locationHint?: string
  courseOptions: string[]
  onClose: () => void
}

export function UniversityLeadModal({
  open,
  source,
  universityId,
  universityName,
  locationHint = '',
  courseOptions,
  onClose,
}: Props) {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [course, setCourse] = useState(courseOptions[0] ?? '')
  const [preferredLocation, setPreferredLocation] = useState(locationHint)
  const [qualification, setQualification] = useState<(typeof QUALIFICATION_OPTIONS)[number]>('Class 12')
  const [shareConsent, setShareConsent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDone(null)
    setError(null)
    setCourse(courseOptions[0] ?? '')
    setPreferredLocation(locationHint)
    setFullName(user?.fullName ?? '')
    setEmail(user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? '')
    if (!isSignedIn) return
    void fetchUserProfile(getToken).then((profile) => {
      if (profile?.phone) setPhone(sanitizeIndianPhoneInput(profile.phone))
      if (profile?.full_name) setFullName(profile.full_name)
      if (profile?.email) setEmail(profile.email)
      if (profile?.city && !locationHint) setPreferredLocation(profile.city)
    })
    // Reset only when the modal opens so parent re-renders do not wipe the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const phoneCheck = validateIndianPhone(phone)
    if (phoneCheck.ok === false) {
      setError(phoneCheck.error)
      return
    }
    setSaving(true)
    try {
      const result = await submitUniversityLead(getToken, {
        fullName: fullName.trim(),
        phone: phoneCheck.digits,
        email: email.trim(),
        course,
        preferredLocation: preferredLocation.trim(),
        qualification,
        universityId,
        universityName,
        source,
        shareConsent,
      })
      setDone(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white border-[3px] border-orange-100 p-5 sm:p-6 text-left shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-educture-orange">
              {UNIVERSITY_LEAD_SOURCE_LABELS[source]}
            </p>
            <h2 className="font-display text-xl text-[#1a1a1a] mt-1">{universityName}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-orange-50" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">Request received</p>
            <p className="text-sm text-emerald-800 mt-2 leading-relaxed">{done}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full py-3 rounded-full bg-educture-orange text-white text-sm font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-3">
            <label className="block text-xs font-semibold text-gray-600">
              Full name
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-gray-600">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-600">
                Phone (WhatsApp)
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(sanitizeIndianPhoneInput(e.target.value))}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block text-xs font-semibold text-gray-600">
              Course interested in
              <select value={course} onChange={(e) => setCourse(e.target.value)} className={inputClass}>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-gray-600">
              Preferred location
              <input
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="City or state"
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-semibold text-gray-600">
              Current qualification
              <select
                value={qualification}
                onChange={(e) => setQualification(e.target.value as (typeof QUALIFICATION_OPTIONS)[number])}
                className={inputClass}
              >
                {QUALIFICATION_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-gray-500">
              Preferred campus: <span className="font-semibold text-gray-700">{universityName}</span>
            </p>
            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={shareConsent}
                onChange={(e) => setShareConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I agree that PRIZMA may share my contact details with this university after counselling, if it is a
                good fit.
              </span>
            </label>
            {error ? (
              <p className="text-sm text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-full bg-educture-orange text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? 'Submitting…' : 'Submit request'}
            </button>
            <p className="text-[11px] text-gray-400">Your phone is never shown publicly on campus pages.</p>
          </form>
        )}
      </div>
    </div>
  )
}

export function UniversityLeadCtas({
  universityId,
  universityName,
  locationHint,
  courseOptions,
  compact = false,
}: {
  universityId: string
  universityName: string
  locationHint?: string
  courseOptions: string[]
  compact?: boolean
}) {
  const [open, setOpen] = useState<UniversityLeadSource | null>(null)

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen('interested')}
          className="w-full px-4 py-2.5 rounded-full bg-educture-orange text-white text-sm font-semibold hover:brightness-95"
        >
          I&apos;m interested
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen('counselling')}
            className="px-5 py-2.5 rounded-full bg-educture-orange text-white text-sm font-semibold"
          >
            Get counselling
          </button>
          <button
            type="button"
            onClick={() => setOpen('interested')}
            className="px-5 py-2.5 rounded-full border-[3px] border-orange-200 bg-white text-sm font-semibold text-[#1a1a1a] hover:border-educture-orange"
          >
            I&apos;m interested
          </button>
          <button
            type="button"
            onClick={() => setOpen('apply')}
            className="px-5 py-2.5 rounded-full border-[3px] border-sky-200 bg-white text-sm font-semibold text-[#1a1a1a] hover:border-sky-400"
          >
            Apply / request info
          </button>
        </div>
      )}
      {open ? (
        <UniversityLeadModal
          open
          source={open}
          universityId={universityId}
          universityName={universityName}
          locationHint={locationHint}
          courseOptions={courseOptions}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  )
}

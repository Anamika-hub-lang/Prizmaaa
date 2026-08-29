'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Video } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useMentorContent } from '../../context/MentorContentContext'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { createClassNotification } from '../../lib/classNotificationsApi'

function toDatetimeLocalValue(label: string): string {
  if (!label || label === 'Set in Meet tab') return ''
  const parsed = Date.parse(label)
  if (Number.isNaN(parsed)) return ''
  const d = new Date(parsed)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatSessionLabel(datetimeLocal: string): string {
  const d = new Date(datetimeLocal)
  if (Number.isNaN(d.getTime())) return datetimeLocal.trim()
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function isScheduledLabel(label: string): boolean {
  const t = label.trim()
  return Boolean(t) && t !== 'Set in Meet tab'
}

export function MentorMeetPage() {
  const { myClasses, setMeetForClass } = useMentorContent()
  const { getToken } = useAuth()
  const [selectedId, setSelectedId] = useState('')
  const [meetLink, setMeetLink] = useState('')
  const [sessionAt, setSessionAt] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId && myClasses[0]) setSelectedId(myClasses[0].id)
  }, [myClasses, selectedId])

  const selected = useMemo(
    () => myClasses.find((c) => c.id === selectedId) ?? null,
    [myClasses, selectedId],
  )

  useEffect(() => {
    if (!selected) return
    setMeetLink(selected.meetLink?.startsWith('http') ? selected.meetLink : '')
    setSessionAt(toDatetimeLocalValue(selected.nextSessionLabel ?? ''))
    setSaved(false)
    setError(null)
  }, [selected])

  function onSelectClass(id: string) {
    setSelectedId(id)
  }

  function save() {
    if (!selectedId) {
      setError('Choose a class first.')
      return
    }
    const link = meetLink.trim()
    if (!link || !link.startsWith('http')) {
      setError('Paste a valid Google Meet link (https://…).')
      return
    }
    if (!sessionAt) {
      setError('Pick the session date and time.')
      return
    }
    const label = formatSessionLabel(sessionAt)
    setMeetForClass(selectedId, link, label)
    setSaved(true)
    setError(null)
    void createClassNotification(getToken, {
      classId: selectedId,
      type: 'schedule',
      title: 'Class schedule updated',
      body: `Next session: ${label}`,
      linkPath: `/student/enrolled/${selectedId}`,
    }).catch(() => {
      /* schedule saved even if notify fails */
    })
  }

  return (
    <>
      <MentorPageHeader
        title="Schedule a class"
        subtitle="Pick a class, set the time, paste the Meet link. Enrolled students see both on their dashboard."
      />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {myClasses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center">
            <p className="font-semibold text-[#1d1d1d]">No classes yet</p>
            <p className="text-sm text-gray-500 mt-2">Create a class first, then schedule it here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-orange-100 bg-white p-5 sm:p-6 space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              1. Choose class
              <select
                value={selectedId}
                onChange={(e) => onSelectClass(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-educture-orange"
              >
                {myClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-gray-700">
              2. Session date & time
              <input
                type="datetime-local"
                value={sessionAt}
                onChange={(e) => {
                  setSessionAt(e.target.value)
                  setSaved(false)
                }}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-educture-orange"
              />
            </label>

            <label className="block text-sm font-semibold text-gray-700">
              3. Google Meet link
              <input
                type="url"
                value={meetLink}
                onChange={(e) => {
                  setMeetLink(e.target.value)
                  setSaved(false)
                }}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-educture-orange"
              />
            </label>

            {error ? (
              <p className="text-sm text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Saved — enrolled students can see this time and Join Meet.
              </p>
            ) : null}

            <AppButton type="button" onClick={save} className="w-full justify-center">
              Save schedule
            </AppButton>
          </div>
        )}

        {myClasses.length > 0 ? (
          <div className="space-y-3">
            {myClasses.map((c) => {
              const scheduled = isScheduledLabel(c.nextSessionLabel)
              const hasLink = Boolean(c.meetLink?.trim() && c.meetLink !== 'https://meet.google.com/')
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectClass(c.id)}
                  className={`w-full text-left rounded-2xl border bg-white p-4 transition ${
                    c.id === selectedId
                      ? 'border-educture-orange shadow-sm'
                      : 'border-orange-100 hover:border-orange-200'
                  }`}
                >
                  <p className="font-semibold text-sm text-[#1d1d1d]">{c.title}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {scheduled ? c.nextSessionLabel : 'Not scheduled yet'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 flex items-center gap-1 truncate">
                    <Video className="w-3.5 h-3.5 shrink-0" />
                    {hasLink ? c.meetLink : 'No Meet link'}
                  </p>
                </button>
              )
            })}
          </div>
        ) : null}
      </main>
    </>
  )
}

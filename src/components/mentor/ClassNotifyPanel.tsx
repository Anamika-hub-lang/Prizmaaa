'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { createClassNotification } from '../../lib/classNotificationsApi'

export function ClassNotifyPanel({ classId, classTitle }: { classId: string; classTitle: string }) {
  const { getToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<'syllabus' | 'update'>('syllabus')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    setErr(null)
    setMsg(null)
    try {
      await createClassNotification(getToken, {
        classId,
        type: pdfFile ? 'syllabus' : type,
        title: title.trim(),
        body: body.trim() || undefined,
        linkPath: `/student/enrolled/${classId}`,
        pdfFile,
      })
      setTitle('')
      setBody('')
      setPdfFile(null)
      setMsg(pdfFile ? 'Syllabus PDF sent to students' : 'Students notified')
      setTimeout(() => setMsg(null), 2500)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not notify')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold text-gray-700 hover:text-educture-orange"
      >
        {open ? 'Hide notify' : 'Notify / syllabus PDF'}
      </button>
      {open && (
        <form onSubmit={(e) => void submit(e)} className="mt-2 space-y-2">
          <p className="text-[11px] text-gray-500">
            Post syllabus PDF or class update for {classTitle}
          </p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'syllabus' | 'update')}
            className="w-full px-2 py-1.5 rounded-lg border text-xs bg-white"
          >
            <option value="syllabus">Syllabus</option>
            <option value="update">Class update</option>
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Title (e.g. Unit 1 syllabus)"
            className="w-full px-2 py-1.5 rounded-lg border text-xs bg-white"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Details (optional)"
            className="w-full px-2 py-1.5 rounded-lg border text-xs bg-white resize-none"
          />
          <label className="block text-[11px] text-gray-600">
            Syllabus PDF (optional, max 4 MB)
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="mt-1 block w-full text-[11px] text-gray-700 file:mr-2 file:rounded-md file:border-0 file:bg-orange-100 file:px-2 file:py-1 file:text-[11px] file:font-semibold file:text-educture-orange"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setPdfFile(file)
                if (file) setType('syllabus')
              }}
            />
          </label>
          {pdfFile && (
            <p className="text-[11px] text-gray-500 truncate">Selected: {pdfFile.name}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="text-xs font-bold text-educture-orange hover:underline disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send to enrolled students'}
          </button>
          {msg && <p className="text-[11px] text-emerald-700">{msg}</p>}
          {err && <p className="text-[11px] text-red-600">{err}</p>}
        </form>
      )}
    </div>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { Link } from '../../compat/react-router-dom'
import {
  fetchStudentNotifications,
  markNotificationsRead,
  type ClassNotification,
} from '../../lib/classNotificationsApi'

function timeAgo(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

function typeLabel(type: string): string {
  switch (type) {
    case 'assignment':
      return 'Assignment'
    case 'schedule':
      return 'Schedule'
    case 'syllabus':
      return 'Syllabus'
    default:
      return 'Update'
  }
}

export function StudentNotificationBell() {
  const { getToken, isSignedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ClassNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!isSignedIn) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStudentNotifications(getToken)
      setItems(data.notifications)
      setUnread(data.unreadCount)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load notifications')
    } finally {
      setLoading(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), 45_000)
    return () => window.clearInterval(id)
  }, [load])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  async function openPanel() {
    const next = !open
    setOpen(next)
    if (next) {
      await load()
      if (unread > 0) {
        try {
          await markNotificationsRead(getToken, { all: true })
          setUnread(0)
          setItems((prev) => prev.map((n) => ({ ...n, read: true })))
        } catch {
          /* keep unread badge if mark-read fails */
        }
      }
    }
  }

  if (!isSignedIn) return null

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => void openPanel()}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-educture-orange/40 hover:text-educture-orange"
        aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-educture-orange text-white text-[10px] font-bold leading-[1.1rem] text-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <button
              type="button"
              className="text-xs font-medium text-educture-orange hover:underline"
              onClick={() => void load()}
            >
              Refresh
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-8 text-sm text-gray-500 text-center">Loading…</p>
            ) : error ? (
              <p className="px-4 py-6 text-sm text-red-600">{error}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-sm text-gray-500 text-center">
                No class updates yet. When your mentor posts an assignment, schedule, or syllabus, it
                shows up here.
              </p>
            ) : (
              <ul>
                {items.map((n) => {
                  const inner = (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-educture-orange">
                          {typeLabel(n.type)}
                        </span>
                        <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                        {!n.read && <span className="ml-auto h-2 w-2 rounded-full bg-educture-orange" />}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.classTitle}</p>
                      {n.body ? <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.body}</p> : null}
                      {n.attachmentUrl ? (
                        <a
                          href={n.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex mt-2 text-[11px] font-semibold text-educture-orange hover:underline"
                        >
                          Download PDF{n.attachmentName ? ` · ${n.attachmentName}` : ''}
                        </a>
                      ) : null}
                    </>
                  )
                  return (
                    <li key={n.id} className="border-b border-gray-50 last:border-0">
                      {n.linkPath && !n.attachmentUrl ? (
                        <Link
                          to={n.linkPath}
                          onClick={() => setOpen(false)}
                          className="block px-4 py-3 hover:bg-orange-50/60 text-left"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="px-4 py-3 text-left hover:bg-orange-50/40">{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

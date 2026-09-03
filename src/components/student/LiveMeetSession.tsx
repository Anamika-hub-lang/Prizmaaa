'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@clerk/nextjs'
import { Award, Clock, Video, X } from 'lucide-react'
import {
  fetchActiveMeetSession,
  formatCountdown,
  heartbeatMeetSession,
  startMeetSession,
  type AttendanceProgress,
  type MeetSessionState,
} from '../../lib/classAttendanceApi'
import { ENROLLMENTS_REFRESH_EVENT } from '../../lib/enrollmentRefresh'

type LiveMeetContextValue = {
  activeSession: MeetSessionState | null
  lastProgress: AttendanceProgress | null
  startingClassId: string | null
  joinMeet: (input: { classId: string; meetLink?: string; classTitle?: string }) => Promise<void>
  dismiss: () => void
}

const LiveMeetContext = createContext<LiveMeetContextValue | null>(null)

function notifyEnrollmentsRefresh() {
  try {
    window.dispatchEvent(new Event(ENROLLMENTS_REFRESH_EVENT))
  } catch {
    /* ignore */
  }
}

export function LiveMeetSessionProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth()
  const [activeSession, setActiveSession] = useState<MeetSessionState | null>(null)
  const [lastProgress, setLastProgress] = useState<AttendanceProgress | null>(null)
  const [startingClassId, setStartingClassId] = useState<string | null>(null)
  const [bannerMessage, setBannerMessage] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const heartbeatBusy = useRef(false)

  useEffect(() => {
    if (!isSignedIn) {
      setActiveSession(null)
      return
    }
    void fetchActiveMeetSession(getToken)
      .then((session) => {
        if (session) {
          setActiveSession(session)
          setDismissed(false)
        }
      })
      .catch(() => {
        /* ignore */
      })
  }, [isSignedIn, getToken])

  useEffect(() => {
    if (!activeSession || activeSession.completed) return

    const tick = async () => {
      if (heartbeatBusy.current) return
      heartbeatBusy.current = true
      try {
        const result = await heartbeatMeetSession(getToken, activeSession.id)
        if (result.session) setActiveSession(result.session)
        if (result.progress) {
          setLastProgress(result.progress)
          notifyEnrollmentsRefresh()
        }
        if (result.attendanceCredited) {
          setBannerMessage(
            result.progress?.completed
              ? '40 minutes done — attendance credited. Course complete — certificate unlocked!'
              : '40 minutes done — today’s attendance credited and progress updated.',
          )
        }
      } catch {
        /* keep trying next interval */
      } finally {
        heartbeatBusy.current = false
      }
    }

    void tick()
    const id = window.setInterval(() => void tick(), 20_000)
    return () => window.clearInterval(id)
  }, [activeSession?.id, activeSession?.completed, getToken])

  const joinMeet = useCallback(
    async (input: { classId: string; meetLink?: string; classTitle?: string }) => {
      const link = input.meetLink?.trim() || 'https://meet.google.com/'
      window.open(link, '_blank', 'noopener,noreferrer')
      setStartingClassId(input.classId)
      setBannerMessage(null)
      setDismissed(false)
      try {
        const result = await startMeetSession(getToken, input.classId)
        if (result.alreadyCredited) {
          setBannerMessage(result.message ?? 'Today’s attendance is already marked.')
          if (result.progress) {
            setLastProgress(result.progress)
            notifyEnrollmentsRefresh()
          }
          setActiveSession(null)
          return
        }
        if (result.session) {
          setActiveSession({
            ...result.session,
            classTitle: input.classTitle ?? result.session.classTitle,
            meetLink: link,
          })
        }
      } catch (err) {
        setBannerMessage(err instanceof Error ? err.message : 'Could not start attendance timer')
      } finally {
        setStartingClassId(null)
      }
    },
    [getToken],
  )

  const dismiss = useCallback(() => {
    setDismissed(true)
    setBannerMessage(null)
  }, [])

  const value = useMemo(
    () => ({ activeSession, lastProgress, startingClassId, joinMeet, dismiss }),
    [activeSession, lastProgress, startingClassId, joinMeet, dismiss],
  )

  const showPanel = !dismissed && (activeSession || bannerMessage)

  return (
    <LiveMeetContext.Provider value={value}>
      {children}
      {showPanel ? (
        <div className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 z-[60] md:w-[22rem]">
          <div className="rounded-2xl border-2 border-orange-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-educture-orange">
                  Live attendance
                </p>
                <p className="font-semibold text-[#1d1d1d] text-sm mt-1 truncate">
                  {activeSession?.classTitle ?? 'Class session'}
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeSession && !activeSession.completed ? (
              <>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-educture-orange shrink-0" />
                  <span>
                    Stay in Meet ·{' '}
                    <span className="font-bold text-[#1d1d1d]">
                      {formatCountdown(
                        activeSession.requiredSeconds - activeSession.accumulatedSeconds,
                      )}
                    </span>{' '}
                    left
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-orange-50 overflow-hidden">
                  <div
                    className="h-full bg-educture-orange transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (activeSession.accumulatedSeconds / activeSession.requiredSeconds) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  Keep this tab open while you are on Google Meet. After 40 minutes, progress fills
                  for today’s class.
                </p>
                {activeSession.meetLink ? (
                  <a
                    href={activeSession.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-educture-orange hover:underline"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Reopen Meet
                  </a>
                ) : null}
              </>
            ) : null}

            {bannerMessage ? (
              <p className="mt-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex gap-2">
                <Award className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bannerMessage}</span>
              </p>
            ) : null}

            {lastProgress ? (
              <p className="mt-2 text-xs text-gray-600">
                Progress {lastProgress.progress}% · {lastProgress.attended}/
                {lastProgress.totalSessions} sessions
                {lastProgress.completed ? ' · Certificate ready' : ''}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </LiveMeetContext.Provider>
  )
}

export function useLiveMeetSession() {
  const ctx = useContext(LiveMeetContext)
  if (!ctx) {
    throw new Error('useLiveMeetSession must be used within LiveMeetSessionProvider')
  }
  return ctx
}

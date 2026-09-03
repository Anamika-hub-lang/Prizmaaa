/** Session schedule helpers — nextSessionLabel may be ISO or a locale display string. */

const JOINED_PREFIX = 'educture_joined_session:'
/** Hide banner once session start + this duration has passed (class window ended). */
const SESSION_WINDOW_MS = 90 * 60 * 1000

export function parseSessionInstant(label: string | null | undefined): Date | null {
  const raw = label?.trim() ?? ''
  if (!raw || raw === 'Set in Meet tab') return null

  const asIso = Date.parse(raw)
  if (!Number.isNaN(asIso)) return new Date(asIso)

  // en-IN style: "2 Sept 2026, 9:10 pm" / "2 Sep 2026, 9:10 pm"
  const normalized = raw
    .replace(/\u00a0/g, ' ')
    .replace(/(\d)(st|nd|rd|th)\b/gi, '$1')
    .replace(/\bSept\b/gi, 'Sep')
  const fallback = Date.parse(normalized)
  if (!Number.isNaN(fallback)) return new Date(fallback)

  return null
}

export function formatSessionLabel(instant: Date | string): string {
  const d = typeof instant === 'string' ? parseSessionInstant(instant) : instant
  if (!d || Number.isNaN(d.getTime())) {
    return typeof instant === 'string' ? instant : ''
  }
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** True while the scheduled meet is still the "current/next" one (not expired). */
export function isSessionUpcomingOrLive(
  label: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const start = parseSessionInstant(label)
  if (!start) return false
  return now.getTime() < start.getTime() + SESSION_WINDOW_MS
}

function joinedStorageKey(classId: string, sessionLabel: string): string {
  return `${JOINED_PREFIX}${classId}:${sessionLabel.trim()}`
}

export function markSessionJoined(classId: string, sessionLabel: string): void {
  if (typeof window === 'undefined') return
  const label = sessionLabel.trim()
  if (!classId || !label) return
  try {
    localStorage.setItem(joinedStorageKey(classId, label), new Date().toISOString())
  } catch {
    /* ignore */
  }
}

export function wasSessionJoined(classId: string, sessionLabel: string): boolean {
  if (typeof window === 'undefined') return false
  const label = sessionLabel.trim()
  if (!classId || !label) return false
  try {
    return Boolean(localStorage.getItem(joinedStorageKey(classId, label)))
  } catch {
    return false
  }
}

/** Show on dashboard / cards only if not past and student has not joined this exact schedule yet. */
export function shouldShowNextSession(
  classId: string,
  sessionLabel: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!sessionLabel?.trim()) return false
  if (!isSessionUpcomingOrLive(sessionLabel, now)) return false
  if (wasSessionJoined(classId, sessionLabel)) return false
  return true
}

export type NextLiveCandidate = {
  classId: string
  title: string
  nextSession: string
  nextSessionDisplay: string
  at: Date
}

export function pickNextLiveSession<
  T extends { id: string; title: string; status: string; type: string; nextSession?: string },
>(courses: T[], now: Date = new Date()): (T & { nextSessionDisplay: string }) | null {
  const ranked: Array<{ course: T; at: Date; display: string }> = []

  for (const course of courses) {
    if (course.status !== 'ongoing' || course.type !== 'online') continue
    const label = course.nextSession
    if (!label || !shouldShowNextSession(course.id, label, now)) continue
    const at = parseSessionInstant(label)
    if (!at) continue
    ranked.push({ course, at, display: formatSessionLabel(label) })
  }

  ranked.sort((a, b) => a.at.getTime() - b.at.getTime())
  const best = ranked[0]
  if (!best) return null
  return { ...best.course, nextSessionDisplay: best.display }
}

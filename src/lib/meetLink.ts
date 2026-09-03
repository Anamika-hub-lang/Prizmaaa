/** True when the URL is a concrete Google Meet room (not the bare home page). */
export function isRealGoogleMeetLink(link?: string | null): boolean {
  const href = (link ?? '').trim()
  if (!href) return false
  try {
    const u = new URL(href)
    if (!/^meet\.google\.com$/i.test(u.hostname)) return false
    const path = u.pathname.replace(/\/+$/, '')
    return path.length > 1
  } catch {
    return false
  }
}

export function normalizeMeetLink(link?: string | null): string | null {
  const href = (link ?? '').trim()
  if (!isRealGoogleMeetLink(href)) return null
  return href
}

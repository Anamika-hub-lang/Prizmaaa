export const ENROLLMENTS_REFRESH_EVENT = 'educture:enrollments-refresh'

export function notifyEnrollmentsRefresh() {
  window.dispatchEvent(new Event(ENROLLMENTS_REFRESH_EVENT))
}

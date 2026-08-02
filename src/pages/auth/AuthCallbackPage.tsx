import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { getPostAuthPath } from '../../lib/userRole'

const AUTH_RETURN_KEY = 'educture_auth_return'

function readStoredAuthReturn(): string | null {
  try {
    const v = sessionStorage.getItem(AUTH_RETURN_KEY)?.trim()
    if (!v || !v.startsWith('/')) return null
    return v
  } catch {
    return null
  }
}

function clearStoredAuthReturn() {
  try {
    sessionStorage.removeItem(AUTH_RETURN_KEY)
  } catch {
    /* ignore */
  }
}

/** Clerk redirect target — resume payment return or route by role / onboarding. */
export function AuthCallbackPage() {
  const { isLoaded, user } = useUser()
  const location = useLocation()
  const fromState = (location.state as { from?: string } | null)?.from

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Signing you in…
      </div>
    )
  }

  const stored = readStoredAuthReturn()
  const from = (fromState && fromState.startsWith('/') ? fromState : null) ?? stored
  if (from) {
    clearStoredAuthReturn()
    return <Navigate to={from} replace />
  }

  return <Navigate to={getPostAuthPath(user)} replace />
}

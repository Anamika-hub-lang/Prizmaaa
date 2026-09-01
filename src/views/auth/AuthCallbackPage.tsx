'use client'

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useRef, useState } from 'react'
import { isAdminUser } from '../../lib/adminAccess'
import { getPostAuthPath } from '../../lib/userRole'
import { syncUserProfile } from '../../lib/syncUserProfile'

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

/** Clerk redirect target — admins → /admin; others resume payment return or role home. */
export function AuthCallbackPage() {
  const { isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const location = useLocation()
  const fromState = (location.state as { from?: string } | null)?.from
  const [ready, setReady] = useState(false)
  const syncStartedRef = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setReady(true)
      return
    }
    if (syncStartedRef.current) return
    syncStartedRef.current = true
    let cancelled = false
    void (async () => {
      try {
        const result = await syncUserProfile(getToken)
        if (result.roleUpdated) {
          await user.reload()
        }
      } catch {
        /* still continue to role home */
      }
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [isLoaded, user, getToken])

  if (!isLoaded || !ready) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Signing you in…
      </div>
    )
  }

  if (isAdminUser(user)) {
    clearStoredAuthReturn()
    return <Navigate to="/admin" replace />
  }

  const stored = readStoredAuthReturn()
  const from = (fromState && fromState.startsWith('/') ? fromState : null) ?? stored
  if (from) {
    clearStoredAuthReturn()
    return <Navigate to={from} replace />
  }

  return <Navigate to={getPostAuthPath(user)} replace />
}

'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/nextjs'
import { fetchPartnerMe } from '../../lib/universityLeadsApi'
import { getPostAuthPath } from '../../lib/userRole'

export function RequirePartnerRoute({ children }: { children: ReactNode }) {
  const { getToken } = useAuth()
  const { isLoaded, user } = useUser()
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading')

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setState('denied')
      return
    }
    let cancelled = false
    void fetchPartnerMe(getToken)
      .then(() => {
        if (!cancelled) setState('ok')
      })
      .catch(() => {
        if (!cancelled) setState('denied')
      })
    return () => {
      cancelled = true
    }
  }, [getToken, isLoaded, user])

  if (!isLoaded || state === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Loading partner portal…
      </div>
    )
  }

  if (state === 'denied') {
    return <Navigate to={getPostAuthPath(user)} replace />
  }

  return <>{children}</>
}

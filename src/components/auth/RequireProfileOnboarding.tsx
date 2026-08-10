'use client'

import { Navigate } from 'react-router-dom'
import { useUser } from '@clerk/nextjs'
import type { ReactNode } from 'react'
import { isAdminUser } from '../../lib/adminAccess'
import { getPostAuthPath, getUserRole, isOnboardingComplete } from '../../lib/userRole'

export function RequireProfileOnboardingOnly({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Loading profile…
      </div>
    )
  }

  if (isAdminUser(user)) {
    return <Navigate to="/admin" replace />
  }

  if (isOnboardingComplete(user)) {
    return <Navigate to={getPostAuthPath(user)} replace />
  }

  if (!getUserRole(user)) {
    return <Navigate to="/onboarding/role" replace />
  }

  return <>{children}</>
}

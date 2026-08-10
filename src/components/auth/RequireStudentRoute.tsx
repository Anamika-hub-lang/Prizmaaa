'use client'

import { Navigate } from 'react-router-dom'
import { useUser } from '@clerk/nextjs'
import type { ReactNode } from 'react'
import { isAdminUser } from '../../lib/adminAccess'
import { getRoleHomePath, getUserRole } from '../../lib/userRole'

export function RequireStudentRoute({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Loading profile…
      </div>
    )
  }

  if (isAdminUser(user?.id)) {
    return <Navigate to="/admin" replace />
  }

  const role = getUserRole(user)
  if (role === 'teacher') {
    return <Navigate to={getRoleHomePath('teacher')} replace />
  }
  if (role !== 'student') {
    return <Navigate to="/onboarding/role" replace />
  }

  return <>{children}</>
}

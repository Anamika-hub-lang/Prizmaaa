'use client'

import { Navigate } from 'react-router-dom'
import { useUser } from '@clerk/nextjs'
import type { ReactNode } from 'react'
import { isAdminUser } from '../../lib/adminAccess'
import { getPostAuthPath, getRoleHomePath, getUserRole } from '../../lib/userRole'

export function RequireTeacherRoute({ children }: { children: ReactNode }) {
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

  const role = getUserRole(user)
  if (role && role !== 'teacher') {
    return <Navigate to={getRoleHomePath(role)} replace />
  }
  if (role !== 'teacher') {
    return <Navigate to={getPostAuthPath(user)} replace />
  }

  return <>{children}</>
}

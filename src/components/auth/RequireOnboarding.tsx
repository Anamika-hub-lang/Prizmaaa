'use client'

import { Navigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState, type ReactNode } from 'react'
import { isAdminUser } from '../../lib/adminAccess'
import { fetchMentorEligible } from '../../lib/mentorEligible'
import { getPostAuthPath, getUserRole, isOnboardingComplete } from '../../lib/userRole'

export function RequireOnboarding({ children }: { children: ReactNode }) {
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

  if (!isOnboardingComplete(user)) {
    return <Navigate to="/onboarding/role" replace />
  }

  return <>{children}</>
}

export function RequireRoleOnboardingOnly({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const [mentorAllowed, setMentorAllowed] = useState(false)
  const [eligibilityChecked, setEligibilityChecked] = useState(false)

  useEffect(() => {
    void fetchMentorEligible(getToken).then((result) => {
      setMentorAllowed(result.allowed)
      setEligibilityChecked(true)
    })
  }, [getToken])

  if (!isLoaded || !eligibilityChecked) {
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
  const complete = isOnboardingComplete(user)
  const upgradingFromStudent = role === 'student' && mentorAllowed

  if (complete && role === 'teacher') {
    return <Navigate to="/teacher" replace />
  }

  if (complete && role === 'student' && !mentorAllowed) {
    return <Navigate to={getPostAuthPath(user)} replace />
  }

  if (role && !complete && !upgradingFromStudent) {
    return <Navigate to="/onboarding/profile" replace />
  }

  return <>{children}</>
}

import { Navigate, Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { getPostAuthPath, getUserRole, isOnboardingComplete } from '../../lib/userRole'

/**
 * Blocks student/teacher portals until the user completes one-time role selection.
 */
export function RequireOnboarding() {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Loading profile…
      </div>
    )
  }

  if (!isOnboardingComplete(user)) {
    return <Navigate to="/onboarding/role" replace />
  }

  return <Outlet />
}

/**
 * Onboarding route only — redirects users who already have a role.
 */
export function RequireRoleOnboardingOnly() {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Loading profile…
      </div>
    )
  }

  if (isOnboardingComplete(user)) {
    return <Navigate to={getPostAuthPath(user)} replace />
  }

  if (getUserRole(user)) {
    return <Navigate to="/onboarding/profile" replace />
  }

  return <Outlet />
}

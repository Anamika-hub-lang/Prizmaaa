import { Navigate, Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { getPostAuthPath, getUserRole, isOnboardingComplete } from '../../lib/userRole'

/** Profile details step — requires role, blocks if onboarding already complete. */
export function RequireProfileOnboardingOnly() {
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

  if (!getUserRole(user)) {
    return <Navigate to="/onboarding/role" replace />
  }

  return <Outlet />
}

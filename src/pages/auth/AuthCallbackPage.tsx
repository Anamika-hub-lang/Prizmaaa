import { Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { getPostAuthPath } from '../../lib/userRole'

/** Clerk redirect target — routes users by role / onboarding state. */
export function AuthCallbackPage() {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Signing you in…
      </div>
    )
  }

  return <Navigate to={getPostAuthPath(user)} replace />
}

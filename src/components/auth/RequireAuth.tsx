import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

export function RequireAuth() {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Checking session…
      </div>
    )
  }

  if (!isSignedIn) {
    const returnTo = `${location.pathname}${location.search}`
    try {
      sessionStorage.setItem('educture_auth_return', returnTo)
    } catch {
      /* ignore */
    }
    return <Navigate to="/sign-in" replace state={{ from: returnTo }} />
  }

  return <Outlet />
}

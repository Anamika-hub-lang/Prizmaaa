import { Navigate, Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { getRoleHomePath, getUserRole } from '../../lib/userRole'

export function RequireTeacherRoute() {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
        Loading profile…
      </div>
    )
  }

  const role = getUserRole(user)
  if (role === 'student') {
    return <Navigate to={getRoleHomePath('student')} replace />
  }
  if (role !== 'teacher') {
    return <Navigate to="/onboarding/role" replace />
  }

  return <Outlet />
}

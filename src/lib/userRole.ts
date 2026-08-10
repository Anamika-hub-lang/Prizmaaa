import type { UserRole } from '../types/auth'
import { isUserRole } from '../types/auth'
import { isAdminUser } from './adminAccess'

type UserWithRoleMetadata = {
  id?: string | null
  publicMetadata?: UserPublicMetadata
} | null | undefined

export function getUserRole(user: UserWithRoleMetadata): UserRole | null {
  const role = user?.publicMetadata?.role
  return isUserRole(role) ? role : null
}

export function isOnboardingComplete(user: UserWithRoleMetadata): boolean {
  if (!user) return false
  if (isAdminUser(user)) return true
  if (user.publicMetadata?.onboardingComplete !== true) return false
  const role = getUserRole(user)
  return role !== null && role !== 'admin'
}

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'student':
      return '/student'
    case 'teacher':
      return '/teacher'
    case 'counsellor':
      return '/counsellor'
    case 'intern':
      return '/data-upload'
    default: {
      const _exhaustive: never = role
      return _exhaustive
    }
  }
}

/** After Google/Clerk login — admins always land on /admin, never student/mentor portals. */
export function getPostAuthPath(user: UserWithRoleMetadata): string {
  if (isAdminUser(user)) return '/admin'
  const role = getUserRole(user)
  if (!role) return '/onboarding/role'
  if (role === 'admin') return '/admin'
  if (!isOnboardingComplete(user)) {
    if (role === 'counsellor' || role === 'intern') return getRoleHomePath(role)
    return '/onboarding/profile'
  }
  return getRoleHomePath(role)
}

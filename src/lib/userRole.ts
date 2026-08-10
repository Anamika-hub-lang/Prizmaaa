import type { UserRole } from '../types/auth'
import { isAdminUser } from './adminAccess'

type UserWithRoleMetadata = {
  id?: string
  publicMetadata?: UserPublicMetadata
} | null | undefined

function isUserRole(value: unknown): value is UserRole {
  return value === 'student' || value === 'teacher'
}

export function getUserRole(user: UserWithRoleMetadata): UserRole | null {
  const role = user?.publicMetadata?.role
  return isUserRole(role) ? role : null
}

export function isOnboardingComplete(user: UserWithRoleMetadata): boolean {
  if (!user) return false
  if (user.publicMetadata?.onboardingComplete !== true) return false
  return getUserRole(user) !== null
}

export function getRoleHomePath(role: UserRole): string {
  return role === 'student' ? '/student' : '/teacher'
}

/** After Google/Clerk login — admins always land on /admin, never student/mentor portals. */
export function getPostAuthPath(user: UserWithRoleMetadata): string {
  if (isAdminUser(user?.id)) return '/admin'
  if (!getUserRole(user)) return '/onboarding/role'
  if (!isOnboardingComplete(user)) return '/onboarding/profile'
  const role = getUserRole(user)
  return role ? getRoleHomePath(role) : '/onboarding/role'
}

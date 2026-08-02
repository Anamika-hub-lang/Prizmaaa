import type { UserRole } from '../types/auth'

type UserWithRoleMetadata = {
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

export function getPostAuthPath(user: UserWithRoleMetadata): string {
  if (!getUserRole(user)) return '/onboarding/role'
  if (!isOnboardingComplete(user)) return '/onboarding/profile'
  const role = getUserRole(user)
  return role ? getRoleHomePath(role) : '/onboarding/role'
}

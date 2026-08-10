export type UserRole = 'admin' | 'student' | 'teacher' | 'counsellor' | 'intern'

/** Roles a user may pick during self-serve onboarding. */
export type SelfServeRole = 'student' | 'teacher'

/** Roles an admin may assign/remove (never grant admin via this UI). */
export type AssignableRole = 'student' | 'teacher' | 'counsellor' | 'intern'

export const USER_ROLES: UserRole[] = ['admin', 'student', 'teacher', 'counsellor', 'intern']

export const SELF_SERVE_ROLES: SelfServeRole[] = ['student', 'teacher']

export const ASSIGNABLE_ROLES: AssignableRole[] = [
  'student',
  'teacher',
  'counsellor',
  'intern',
]

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === 'admin' ||
    value === 'student' ||
    value === 'teacher' ||
    value === 'counsellor' ||
    value === 'intern'
  )
}

export function isSelfServeRole(value: unknown): value is SelfServeRole {
  return value === 'student' || value === 'teacher'
}

export function isAssignableRole(value: unknown): value is AssignableRole {
  return (
    value === 'student' ||
    value === 'teacher' ||
    value === 'counsellor' ||
    value === 'intern'
  )
}

export function roleDisplayLabel(role: UserRole | null | undefined): string {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'student':
      return 'Student'
    case 'teacher':
      return 'Mentor'
    case 'counsellor':
      return 'Counsellor'
    case 'intern':
      return 'Intern'
    case null:
    case undefined:
      return 'Member'
    default: {
      const _exhaustive: never = role
      return _exhaustive
    }
  }
}

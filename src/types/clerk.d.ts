import type { UserRole } from './auth'

declare global {
  interface UserPublicMetadata {
    role?: UserRole
    onboardingComplete?: boolean
  }
}

export {}

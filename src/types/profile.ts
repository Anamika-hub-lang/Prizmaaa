import type { UserRole } from './auth'

export type Profile = {
  id: string
  clerk_id: string
  full_name: string | null
  email: string | null
  role: UserRole | null
  avatar_url: string | null
  created_at: string
}

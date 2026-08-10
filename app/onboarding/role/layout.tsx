'use client'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireRoleOnboardingOnly } from '@/components/auth/RequireOnboarding'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireRoleOnboardingOnly>{children}</RequireRoleOnboardingOnly>
    </RequireAuth>
  )
}

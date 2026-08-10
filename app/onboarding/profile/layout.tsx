'use client'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireProfileOnboardingOnly } from '@/components/auth/RequireProfileOnboarding'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireProfileOnboardingOnly>{children}</RequireProfileOnboardingOnly>
    </RequireAuth>
  )
}

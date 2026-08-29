import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireRoleOnboardingOnly } from '@/components/auth/RequireOnboarding'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Onboarding')

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireRoleOnboardingOnly>{children}</RequireRoleOnboardingOnly>
    </RequireAuth>
  )
}

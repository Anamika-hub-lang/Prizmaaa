import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireProfileOnboardingOnly } from '@/components/auth/RequireProfileOnboarding'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Onboarding')

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireProfileOnboardingOnly>{children}</RequireProfileOnboardingOnly>
    </RequireAuth>
  )
}

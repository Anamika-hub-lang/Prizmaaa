import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireInternRoute } from '@/components/auth/RequireInternRoute'
import { InternLayout } from '@/components/layout/InternLayout'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Data upload')

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireInternRoute>
        <InternLayout>{children}</InternLayout>
      </RequireInternRoute>
    </RequireAuth>
  )
}

import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequirePartnerRoute } from '@/components/auth/RequirePartnerRoute'
import { PartnerLayout } from '@/components/layout/PartnerLayout'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Partner')

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequirePartnerRoute>
        <PartnerLayout>{children}</PartnerLayout>
      </RequirePartnerRoute>
    </RequireAuth>
  )
}

'use client'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireInternRoute } from '@/components/auth/RequireInternRoute'
import { InternLayout } from '@/components/layout/InternLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireInternRoute>
        <InternLayout>{children}</InternLayout>
      </RequireInternRoute>
    </RequireAuth>
  )
}

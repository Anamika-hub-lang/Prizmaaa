import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireCounsellorRoute } from '@/components/auth/RequireCounsellorRoute'
import { CounsellorLayout } from '@/components/layout/CounsellorLayout'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Counsellor')

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireCounsellorRoute>
        <CounsellorLayout>{children}</CounsellorLayout>
      </RequireCounsellorRoute>
    </RequireAuth>
  )
}

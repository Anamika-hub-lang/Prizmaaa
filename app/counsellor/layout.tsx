'use client'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireCounsellorRoute } from '@/components/auth/RequireCounsellorRoute'
import { CounsellorLayout } from '@/components/layout/CounsellorLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireCounsellorRoute>
        <CounsellorLayout>{children}</CounsellorLayout>
      </RequireCounsellorRoute>
    </RequireAuth>
  )
}

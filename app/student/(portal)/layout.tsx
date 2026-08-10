'use client'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireOnboarding } from '@/components/auth/RequireOnboarding'
import { RequireStudentRoute } from '@/components/auth/RequireStudentRoute'
import { StudentLayout } from '@/components/layout/StudentLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireOnboarding>
        <RequireStudentRoute>
          <StudentLayout>{children}</StudentLayout>
        </RequireStudentRoute>
      </RequireOnboarding>
    </RequireAuth>
  )
}

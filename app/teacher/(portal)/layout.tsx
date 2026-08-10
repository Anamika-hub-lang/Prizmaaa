'use client'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireOnboarding } from '@/components/auth/RequireOnboarding'
import { RequireTeacherRoute } from '@/components/auth/RequireTeacherRoute'
import { TeacherLayout } from '@/components/layout/TeacherLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireOnboarding>
        <RequireTeacherRoute>
          <TeacherLayout>{children}</TeacherLayout>
        </RequireTeacherRoute>
      </RequireOnboarding>
    </RequireAuth>
  )
}

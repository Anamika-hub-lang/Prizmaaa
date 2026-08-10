'use client'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireAdminRoute } from '@/components/auth/RequireAdminRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireAdminRoute>
        <AdminLayout>{children}</AdminLayout>
      </RequireAdminRoute>
    </RequireAuth>
  )
}

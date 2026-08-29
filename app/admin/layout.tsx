import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireAdminRoute } from '@/components/auth/RequireAdminRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Admin')

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireAdminRoute>
        <AdminLayout>{children}</AdminLayout>
      </RequireAdminRoute>
    </RequireAuth>
  )
}

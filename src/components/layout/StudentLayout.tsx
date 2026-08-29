'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from '../../compat/react-router-dom'
import { Menu, X } from 'lucide-react'
import { CashfreePendingConfirm } from '../checkout/CashfreePendingConfirm'
import { PortalUserAvatar } from './PortalUserAvatar'
import { StudentNotificationBell } from '../student/StudentNotificationBell'
import { StudentMobileNav, StudentSidebar, studentSidebarNav } from './StudentSidebar'

const mobileNav = studentSidebarNav.slice(0, 4)

export function StudentLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <StudentSidebar className="hidden md:flex w-60 fixed inset-y-0 left-0 z-20" />

      {sidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <StudentSidebar
            className="fixed inset-y-0 left-0 z-50 w-64 shadow-xl md:hidden"
            onNavigate={() => setSidebarOpen(false)}
          />
        </>
      )}

      <div className="flex flex-col min-w-0 min-h-screen md:ml-60">
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600"
            aria-label="Open menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <StudentNotificationBell />
            <PortalUserAvatar profilePath="/student/profile" />
          </div>
        </header>

        <div className="hidden md:flex items-center justify-end gap-3 px-6 py-3 bg-white/80 border-b border-gray-100">
          <StudentNotificationBell />
          <PortalUserAvatar profilePath="/student/profile" />
        </div>

        <CashfreePendingConfirm />

        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 md:pb-8 max-w-5xl w-full mx-auto">{children}</main>

        <StudentMobileNav items={mobileNav} />
      </div>
    </div>
  )
}

export function StudentPageHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
}: {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
}) {
  return (
    <div className="mb-6 text-left">
      {backTo && (
        <Link to={backTo} className="text-sm font-medium text-educture-orange hover:underline mb-2 inline-block">
          ← {backLabel}
        </Link>
      )}
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-1 max-w-2xl">{subtitle}</p>}
    </div>
  )
}

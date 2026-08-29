'use client'

import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { PortalUserAvatar } from './PortalUserAvatar'
import { MentorMobileNav, MentorSidebar, mentorSidebarNav } from './MentorSidebar'

const mobileNav = mentorSidebarNav.slice(0, 4)

export function TeacherLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <MentorSidebar className="hidden md:flex w-60 fixed inset-y-0 left-0 z-20" />

      {sidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <MentorSidebar
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
          <PortalUserAvatar profilePath="/teacher/profile" />
        </header>

        <div className="hidden md:flex items-center justify-end px-6 py-3 bg-white/80 border-b border-gray-100">
          <PortalUserAvatar profilePath="/teacher/profile" />
        </div>

        <div className="flex-1 min-w-0 pb-24 md:pb-0">{children}</div>

        <MentorMobileNav items={mobileNav} />
      </div>
    </div>
  )
}

export function MentorPageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2 text-left">
      <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d]">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-2 max-w-2xl">{subtitle}</p>}
    </div>
  )
}

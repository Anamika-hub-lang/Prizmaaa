import type { ReactNode } from 'react'
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  Gift,
  LayoutDashboard,
  User,
} from 'lucide-react'
import { PortalUserAvatar } from './PortalUserAvatar'
import { BrandLogo } from '../brand/BrandLogo'
import { PortalHeaderNav, PortalMobileBottomNav, type PortalNavItem } from './PortalNav'
import { SyncStatusBanner } from './SyncStatusBanner'

const primaryNav: PortalNavItem[] = [
  { to: '/teacher/classes', icon: BookOpen, label: 'Classes', match: '/teacher/classes' },
  { to: '/teacher/free-courses', icon: Gift, label: 'Courses', match: '/teacher/free-courses' },
  { to: '/teacher/meet', icon: Calendar, label: 'Schedules', match: '/teacher/meet' },
]

const menuNav: PortalNavItem[] = [
  { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard', match: '/teacher', exact: true },
  { to: '/teacher/assignments', icon: ClipboardList, label: 'Assignments', match: '/teacher/assignments' },
  { to: '/teacher/profile', icon: User, label: 'Profile', match: '/teacher/profile' },
]

export function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <BrandLogo to="/" size="sm" showWordmark={false} className="md:hidden" />
            <BrandLogo to="/" size="md" className="hidden md:flex" />
            <span className="hidden lg:inline text-xs text-gray-400 shrink-0">Mentor</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
            <PortalHeaderNav primary={primaryNav} menu={menuNav} menuLabel="Mentor menu" />
            <button
              type="button"
              className="hidden sm:inline-flex p-2 text-gray-500 shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <PortalUserAvatar profilePath="/teacher/profile" />
          </div>
        </div>
      </header>

      <SyncStatusBanner />

      <div className="flex-1 min-w-0 pb-[4.75rem] md:pb-0">
        {children}
      </div>

      <PortalMobileBottomNav primary={primaryNav} />
    </div>
  )
}

export function MentorPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-[#fff9f3] border-b border-orange-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em]">Mentor portal</p>
        <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d] mt-2">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-2 max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  )
}

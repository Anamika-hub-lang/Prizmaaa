import type { ReactNode } from 'react'
import { Bell, BookOpen, Calendar, ClipboardList, LayoutDashboard, User, Video } from 'lucide-react'
import { tintedSurface } from '../ui/dashboardCardStyles'
import { PortalUserAvatar } from './PortalUserAvatar'
import { CashfreePendingConfirm } from '../checkout/CashfreePendingConfirm'
import { formatBrowsePricingSummary } from '../../data/classCatalog'
import { BrandLogo } from '../brand/BrandLogo'
import { PortalHeaderNav, PortalMobileBottomNav, type PortalNavItem } from './PortalNav'

const primaryNav: PortalNavItem[] = [
  { to: '/student/browse', icon: Video, label: 'Classes', match: '/student/browse' },
  { to: '/student/free', icon: BookOpen, label: 'Courses', match: '/student/free' },
  { to: '/student/calendar', icon: Calendar, label: 'Calendar', match: '/student/calendar' },
]

const menuNav: PortalNavItem[] = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', match: '/student', exact: true },
  { to: '/student/assignments', icon: ClipboardList, label: 'Assignments', match: '/student/assignments' },
  { to: '/student/profile', icon: User, label: 'Profile', match: '/student/profile' },
]

export function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 flex items-center gap-2 min-w-0">
          <BrandLogo to="/" size="sm" showWordmark={false} className="md:hidden shrink-0" />
          <BrandLogo to="/" size="md" className="hidden md:flex shrink-0" />

          <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
            <PortalHeaderNav primary={primaryNav} menu={menuNav} menuLabel="Student menu" />
            <button
              type="button"
              className="hidden sm:inline-flex p-2 text-gray-500 hover:text-educture-orange shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <PortalUserAvatar profilePath="/student/profile" />
          </div>
        </div>
      </header>

      <CashfreePendingConfirm />
      <div className="flex-1 min-w-0 pb-[4.75rem] md:pb-0">
        {children}
      </div>

      <PortalMobileBottomNav primary={primaryNav} />
    </div>
  )
}

export function StudentPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-[#fff9f3] border-b border-orange-100/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-7 md:py-8 text-left min-w-0">
        <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-[#1d1d1d] leading-tight break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-full leading-relaxed break-words">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export function EnrollmentSteps() {
  const planLine = formatBrowsePricingSummary()
  const steps = [
    { n: '1', title: 'Pick a class', desc: 'Browse categories and choose your online class.' },
    { n: '2', title: 'Choose a plan', desc: `${planLine}. Monthly, 3-month, or 6-month — pay upfront.` },
    { n: '3', title: 'Meet your mentor', desc: 'We connect you with your assigned mentor.' },
    { n: '4', title: 'Join Google Meet', desc: 'Live sessions happen on Google Meet — link in your dashboard.' },
  ]
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      {steps.map((s, i) => (
        <div key={s.n} className={`${tintedSurface(i)} p-4 text-left`}>
          <span className="w-8 h-8 rounded-full bg-educture-orange text-white text-sm font-bold flex items-center justify-center">
            {s.n}
          </span>
          <p className="font-bold text-sm mt-3 text-[#1d1d1d]">{s.title}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  )
}

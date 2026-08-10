import type { ReactNode } from 'react'
import { CalendarCheck, LayoutDashboard } from 'lucide-react'
import { BrandLogo } from '../brand/BrandLogo'
import { PortalUserAvatar } from './PortalUserAvatar'
import { PortalHeaderNav, PortalMobileBottomNav, type PortalNavItem } from './PortalNav'

const primaryNav: PortalNavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', match: '/admin', exact: true },
  {
    to: '/admin/counselling',
    icon: CalendarCheck,
    label: 'Counselling',
    match: '/admin/counselling',
  },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <BrandLogo to="/" size="sm" showWordmark={false} className="md:hidden" />
            <BrandLogo to="/" size="md" className="hidden md:flex" />
            <span className="hidden lg:inline text-xs text-gray-400 shrink-0">Admin</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
            <PortalHeaderNav primary={primaryNav} menu={[]} menuLabel="Admin" />
            <PortalUserAvatar profilePath="/admin" />
          </div>
        </div>
      </header>

      <div className="flex-1 min-w-0 pb-[4.75rem] md:pb-0">
        {children}
      </div>

      <PortalMobileBottomNav primary={primaryNav} />
    </div>
  )
}

export function AdminPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-[#fff9f3] border-b border-orange-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em]">Admin panel</p>
        <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d] mt-2">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-2 max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  )
}

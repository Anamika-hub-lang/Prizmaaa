import { Link, useLocation } from '../../compat/react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  User,
  Video,
  GraduationCap,
} from 'lucide-react'
import { BrandLogo } from '../brand/BrandLogo'
import { isPortalNavActive, type PortalNavItem } from './PortalNav'

export const studentSidebarNav: PortalNavItem[] = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', match: '/student', exact: true },
  { to: '/student/browse', icon: Video, label: 'Browse classes', match: '/student/browse' },
  { to: '/student/free', icon: BookOpen, label: 'Free courses', match: '/student/free' },
  { to: '/student/calendar', icon: Calendar, label: 'Calendar', match: '/student/calendar' },
  { to: '/student/assignments', icon: ClipboardList, label: 'Assignments', match: '/student/assignments' },
  { to: '/student/profile', icon: User, label: 'Profile', match: '/student/profile' },
]

function SidebarLink({ item, onNavigate }: { item: PortalNavItem; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const active = isPortalNavActive(pathname, item)
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-educture-orange/10 text-educture-orange'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {item.label}
    </Link>
  )
}

export function StudentSidebar({
  onNavigate,
  className = '',
}: {
  onNavigate?: () => void
  className?: string
}) {
  return (
    <aside className={`flex flex-col h-full min-h-screen bg-white border-r border-gray-100 ${className}`}>
      <div className="px-4 py-5 border-b border-gray-50">
        <BrandLogo to="/student" size="md" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-3">Student</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Student navigation">
        {studentSidebarNav.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-50 mt-auto shrink-0">
        <Link
          to="/counselling"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-sky-50 hover:text-sky-700 transition-colors"
        >
          <GraduationCap className="h-5 w-5 shrink-0" />
          Book counselling
        </Link>
      </div>
    </aside>
  )
}

export function StudentMobileNav({ items }: { items: PortalNavItem[] }) {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 max-w-lg mx-auto">
        {items.map((item) => {
          const active = isPortalNavActive(pathname, item)
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold ${
                active ? 'text-educture-orange' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate max-w-full px-1">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

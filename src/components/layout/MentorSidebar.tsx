import { Link, useLocation } from '../../compat/react-router-dom'
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Gift,
  LayoutDashboard,
  User,
} from 'lucide-react'
import { BrandLogo } from '../brand/BrandLogo'
import { isPortalNavActive, type PortalNavItem } from './PortalNav'

export const mentorSidebarNav: PortalNavItem[] = [
  { to: '/teacher', icon: LayoutDashboard, label: 'Home', match: '/teacher', exact: true },
  { to: '/teacher/classes', icon: BookOpen, label: 'Classes', match: '/teacher/classes' },
  { to: '/teacher/free-courses', icon: Gift, label: 'Courses', match: '/teacher/free-courses' },
  { to: '/teacher/meet', icon: Calendar, label: 'Schedules', match: '/teacher/meet' },
  { to: '/teacher/assignments', icon: ClipboardList, label: 'Assignments', match: '/teacher/assignments' },
  { to: '/teacher/profile', icon: User, label: 'Profile', match: '/teacher/profile' },
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

export function MentorSidebar({
  onNavigate,
  className = '',
}: {
  onNavigate?: () => void
  className?: string
}) {
  return (
    <aside className={`flex flex-col h-full min-h-screen bg-white border-r border-gray-100 ${className}`}>
      <div className="px-4 py-5 border-b border-gray-50">
        <BrandLogo to="/teacher" size="md" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-3">Mentor</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Mentor navigation">
        {mentorSidebarNav.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </aside>
  )
}

export function MentorMobileNav({ items }: { items: PortalNavItem[] }) {
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

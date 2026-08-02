import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Video,
  Gift,
  ClipboardList,
  Bell,
  User,
} from 'lucide-react'
import { PortalUserAvatar } from './PortalUserAvatar'

const nav = [
  { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/teacher/classes', icon: BookOpen, label: 'Online classes' },
  { to: '/teacher/free-courses', icon: Gift, label: 'Free courses' },
  { to: '/teacher/meet', icon: Video, label: 'Google Meet' },
  { to: '/teacher/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/teacher/profile', icon: User, label: 'Profile' },
]

function navActive(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to
  return pathname === to || pathname.startsWith(to + '/')
}

export function TeacherLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 flex-wrap">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-full bg-educture-orange flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </span>
            <div>
              <span className="font-bold text-[#1d1d1d]">Educture</span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-2">Mentor</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-wrap">
            {nav.map((item) => {
              const active = navActive(location.pathname, item.to, item.exact)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? 'bg-educture-orange/10 text-educture-orange'
                      : 'text-gray-600 hover:text-educture-orange hover:bg-educture-cream'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            <button type="button" className="p-2 text-gray-500" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <PortalUserAvatar profilePath="/teacher/profile" />
          </div>
        </div>
      </header>

      <Outlet />
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

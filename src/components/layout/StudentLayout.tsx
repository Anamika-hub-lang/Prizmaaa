import {
  Bell,
  GraduationCap,
  LayoutDashboard,
  Video,
  Gift,
  ClipboardList,
  Calendar,
  Search,
  User,
} from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { tintedSurface } from '../ui/dashboardCardStyles'
import { PortalUserAvatar } from './PortalUserAvatar'
import { formatBrowsePricingSummary } from '../../data/classCatalog'

const nav = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', match: '/student' },
  { to: '/student/browse', icon: Video, label: 'Online Classes', match: '/student/browse' },
  { to: '/student/free', icon: Gift, label: 'Free Courses', match: '/student/free' },
  { to: '/student/assignments', icon: ClipboardList, label: 'Assignments', match: '/student/assignments' },
  { to: '/student/calendar', icon: Calendar, label: 'Calendar', match: '/student/calendar' },
  { to: '/student/profile', icon: User, label: 'Profile', match: '/student/profile' },
]

function isNavActive(pathname: string, match: string) {
  if (match === '/student') return pathname === '/student'
  if (match === '/student/browse') {
    return pathname === '/student/browse' || pathname.startsWith('/student/browse/')
  }
  return pathname === match || pathname.startsWith(match + '/')
}

export function StudentLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 flex-wrap">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-full bg-educture-orange flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </span>
            <span className="font-bold text-[#1d1d1d]">Educture</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-wrap">
            {nav.map((item) => {
              const active = isNavActive(location.pathname, item.match)
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

          <div className="flex-1 max-w-sm hidden lg:block">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                placeholder="Search classes..."
                className="bg-transparent text-sm w-full outline-none text-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button type="button" className="p-2 text-gray-500 hover:text-educture-orange" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <PortalUserAvatar profilePath="/student/profile" />
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  )
}

export function StudentPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-[#fff9f3] border-b border-orange-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d] mt-2">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-2 max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  )
}

export function EnrollmentSteps() {
  const planLine = formatBrowsePricingSummary()
  const steps = [
    { n: '1', title: 'Pick a class', desc: 'Browse categories and choose your online class.' },
    { n: '2', title: 'Choose a plan', desc: `${planLine}. Starter trial, monthly, or 3-month bundle.` },
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

'use client'

import {
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  Tags,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { DashboardPageHeader, DashboardSidebar, type SidebarNavItem } from './DashboardSidebar'

const adminNav: SidebarNavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', match: '/admin', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users', match: '/admin/users' },
  {
    to: '/admin/counselling-types',
    icon: Tags,
    label: 'Counselling types',
    match: '/admin/counselling-types',
  },
  {
    to: '/admin/counsellors',
    icon: UserRound,
    label: 'Counsellors',
    match: '/admin/counsellors',
  },
  {
    to: '/admin/uploads',
    icon: FileSpreadsheet,
    label: 'CSV approvals',
    match: '/admin/uploads',
  },
  {
    to: '/admin/counselling',
    icon: CalendarCheck,
    label: 'Bookings',
    match: '/admin/counselling',
  },
  { to: '/admin/enrollments', icon: GraduationCap, label: 'Courses', match: '/admin/enrollments' },
  { to: '/admin/interviews', icon: BookOpen, label: 'Classes', match: '/admin/interviews' },
  { to: '/admin/mentors', icon: UserPlus, label: 'Mentors', match: '/admin/mentors' },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardSidebar title="Admin" items={adminNav} profilePath="/admin">
      {children}
    </DashboardSidebar>
  )
}

export function AdminPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <DashboardPageHeader eyebrow="Admin panel" title={title} subtitle={subtitle} />
}

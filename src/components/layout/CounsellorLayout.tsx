'use client'

import { CalendarCheck, ClipboardList, Tags, ToggleLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { DashboardPageHeader, DashboardSidebar, type SidebarNavItem } from './DashboardSidebar'

const counsellorNav: SidebarNavItem[] = [
  { to: '/counsellor', icon: Tags, label: 'Assigned types', match: '/counsellor', exact: true },
  {
    to: '/counsellor/leads',
    icon: ClipboardList,
    label: 'University leads',
    match: '/counsellor/leads',
  },
  {
    to: '/counsellor/bookings',
    icon: CalendarCheck,
    label: 'Bookings',
    match: '/counsellor/bookings',
  },
  {
    to: '/counsellor/availability',
    icon: ToggleLeft,
    label: 'Availability',
    match: '/counsellor/availability',
  },
]

export function CounsellorLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardSidebar title="Counsellor" items={counsellorNav} profilePath="/counsellor">
      {children}
    </DashboardSidebar>
  )
}

export function CounsellorPageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return <DashboardPageHeader eyebrow="Counsellor dashboard" title={title} subtitle={subtitle} />
}

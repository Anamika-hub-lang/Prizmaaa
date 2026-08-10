'use client'

import { FileSpreadsheet, History } from 'lucide-react'
import type { ReactNode } from 'react'
import { DashboardPageHeader, DashboardSidebar, type SidebarNavItem } from './DashboardSidebar'

const internNav: SidebarNavItem[] = [
  {
    to: '/data-upload',
    icon: FileSpreadsheet,
    label: 'Upload CSV',
    match: '/data-upload',
    exact: true,
  },
  {
    to: '/data-upload/history',
    icon: History,
    label: 'History',
    match: '/data-upload/history',
  },
]

export function InternLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardSidebar title="Intern" items={internNav} profilePath="/data-upload">
      {children}
    </DashboardSidebar>
  )
}

export function InternPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <DashboardPageHeader eyebrow="Data upload" title={title} subtitle={subtitle} />
}

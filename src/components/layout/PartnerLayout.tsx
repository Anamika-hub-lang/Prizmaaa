'use client'

import { LayoutDashboard } from 'lucide-react'
import type { ReactNode } from 'react'
import { DashboardPageHeader, DashboardSidebar, type SidebarNavItem } from './DashboardSidebar'

const partnerNav: SidebarNavItem[] = [
  { to: '/partner', icon: LayoutDashboard, label: 'Dashboard', match: '/partner', exact: true },
]

export function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardSidebar title="Partner" items={partnerNav} profilePath="/partner">
      {children}
    </DashboardSidebar>
  )
}

export function PartnerPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <DashboardPageHeader eyebrow="University partner" title={title} subtitle={subtitle} />
}

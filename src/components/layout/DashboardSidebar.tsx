'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from '../../compat/react-router-dom'
import { BrandLogo } from '../brand/BrandLogo'
import { PortalUserAvatar } from './PortalUserAvatar'

export type SidebarNavItem = {
  to: string
  icon: LucideIcon
  label: string
  match: string
  exact?: boolean
  badge?: string | number
}

function isActive(pathname: string, item: SidebarNavItem): boolean {
  if (item.exact) return pathname === item.to
  return pathname === item.match || pathname.startsWith(`${item.match}/`)
}

export function DashboardSidebar({
  title,
  items,
  profilePath,
  children,
}: {
  title: string
  items: SidebarNavItem[]
  profilePath: string
  children: ReactNode
}) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-orange-100/80 bg-white">
        <div className="px-4 py-4 border-b border-orange-50 flex items-center gap-2">
          <BrandLogo to="/" size="md" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-educture-orange/10 text-educture-orange'
                    : 'text-gray-600 hover:bg-[#fff9f3] hover:text-educture-orange'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge != null && item.badge !== '' ? (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-educture-orange">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-orange-50 p-3">
          <PortalUserAvatar profilePath={profilePath} />
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col pb-[4.75rem] md:pb-0">
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <BrandLogo to="/" size="sm" showWordmark={false} />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 truncate">
              {title}
            </span>
          </div>
          <PortalUserAvatar profilePath={profilePath} />
        </header>

        <div className="flex-1 min-w-0">{children}</div>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-orange-100 bg-white/95 backdrop-blur">
          <div className="flex overflow-x-auto px-1 py-1.5 gap-0.5">
            {items.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex min-w-[4.5rem] flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold ${
                    active ? 'text-educture-orange bg-educture-orange/10' : 'text-gray-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate max-w-full">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

export function DashboardPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="bg-[#fff9f3] border-b border-orange-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em]">{eyebrow}</p>
          <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d] mt-2">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-500 mt-2 max-w-2xl">{subtitle}</p> : null}
        </div>
        {actions ? <div className="shrink-0 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

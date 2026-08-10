import { useEffect, useState } from 'react'
import { Link, useLocation } from '../../compat/react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Menu, X } from 'lucide-react'

export type PortalNavItem = {
  to: string
  icon: LucideIcon
  label: string
  match: string
  exact?: boolean
}

export function isPortalNavActive(pathname: string, item: PortalNavItem): boolean {
  if (item.exact) return pathname === item.to
  if (item.match === '/student') return pathname === '/student'
  if (item.match === '/student/browse') {
    return pathname === '/student/browse' || pathname.startsWith('/student/browse/')
  }
  return pathname === item.match || pathname.startsWith(`${item.match}/`)
}

function desktopLinkClass(active: boolean) {
  return `inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
    active
      ? 'bg-educture-orange/10 text-educture-orange'
      : 'text-gray-600 hover:text-educture-orange hover:bg-educture-cream'
  }`
}

type PortalNavProps = {
  primary: PortalNavItem[]
  menu: PortalNavItem[]
  menuLabel?: string
}

function PortalMenuPanel({
  open,
  onClose,
  menu,
  menuLabel,
  pathname,
}: {
  open: boolean
  onClose: () => void
  menu: PortalNavItem[]
  menuLabel: string
  pathname: string
}) {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/40 md:bg-black/20"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className="fixed inset-y-0 right-0 z-[70] flex h-full w-[min(100%,18rem)] flex-col bg-white shadow-2xl md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:h-auto md:w-56 md:rounded-2xl md:border-2 md:border-orange-100 md:py-2 md:shadow-xl"
        role="menu"
      >
        <div className="flex items-center justify-between border-b border-orange-50 px-4 py-3 md:hidden">
          <p className="text-sm font-bold text-[#1d1d1d]">{menuLabel}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-orange-100 text-gray-600"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="hidden px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 md:block">
          {menuLabel}
        </p>
        <div className="flex-1 overflow-y-auto py-1 md:flex-none">
          {menu.map((item) => {
            const active = isPortalNavActive(pathname, item)
            return (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors md:py-2.5 ${
                  active
                    ? 'bg-educture-orange/10 text-educture-orange'
                    : 'text-gray-700 hover:bg-educture-cream hover:text-educture-orange'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

/** Desktop header links + hamburger for secondary pages */
export function PortalHeaderNav({ primary, menu, menuLabel = 'More' }: PortalNavProps) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const menuActive = menu.some((item) => isPortalNavActive(location.pathname, item))

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <nav className="hidden md:flex items-center gap-1" aria-label="Main">
        {primary.map((item) => {
          const active = isPortalNavActive(location.pathname, item)
          return (
            <Link key={item.to} to={item.to} className={desktopLinkClass(active)}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {menu.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
              open || menuActive
                ? 'border-educture-orange bg-educture-orange/10 text-educture-orange'
                : 'border-orange-100 text-gray-600 hover:border-educture-orange/40 hover:text-educture-orange'
            }`}
            aria-label={menuLabel}
            aria-expanded={open}
            aria-haspopup="true"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <PortalMenuPanel
            open={open}
            onClose={() => setOpen(false)}
            menu={menu}
            menuLabel={menuLabel}
            pathname={location.pathname}
          />
        </div>
      )}
    </div>
  )
}

/** Primary links fixed at bottom on phones */
export function PortalMobileBottomNav({ primary }: { primary: PortalNavItem[] }) {
  const location = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
      aria-label="Mobile navigation"
    >
      <div
        className={`grid gap-0 max-w-lg mx-auto ${
          primary.length === 2
            ? 'grid-cols-2'
            : primary.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-4'
        }`}
      >
        {primary.map((item) => {
          const active = isPortalNavActive(location.pathname, item)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 text-[10px] font-semibold transition-colors ${
                active ? 'text-educture-orange' : 'text-gray-500'
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'text-educture-orange' : ''}`} />
              <span className="truncate max-w-full">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/** @deprecated Use PortalHeaderNav + PortalMobileBottomNav */
export function PortalNav(props: PortalNavProps) {
  return (
    <>
      <PortalHeaderNav {...props} />
      <PortalMobileBottomNav primary={props.primary} />
    </>
  )
}

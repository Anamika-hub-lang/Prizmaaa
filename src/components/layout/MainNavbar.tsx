import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { BrandLogo } from '../brand/BrandLogo'
import { useState } from 'react'
import { NavbarAuth } from '../auth/NavbarAuth'

const links = [
  { to: '/', label: 'Home' },
  { to: '/colleges', label: 'Colleges' },
  { to: '/counselling', label: 'Guidance' },
  { to: '/ai', label: 'AI Tools' },
  { to: '/universities', label: 'Stories' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Plans' },
]

export function MainNavbar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo to="/" size="lg" className="py-0.5" />

          <nav className="hidden lg:flex items-center justify-center gap-8 text-[15px] font-medium text-gray-600">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:text-educture-orange transition-colors ${
                  location.pathname === link.to ||
                  (link.to !== '/' && location.pathname.startsWith(`${link.to}/`))
                    ? 'text-educture-orange font-semibold'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <NavbarAuth />

          <button
            type="button"
            className="lg:hidden p-2 rounded-xl border-[3px] border-orange-100"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <nav className="lg:hidden pt-4 flex flex-col gap-1 border-t border-gray-100 mt-3 pb-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="py-3 text-sm font-medium text-gray-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <NavbarAuth mobile onNavigate={() => setOpen(false)} />
          </nav>
        )}
      </div>
    </header>
  )
}

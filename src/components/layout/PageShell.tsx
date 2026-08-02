import type { ReactNode } from 'react'
import { MainNavbar } from './MainNavbar'
import { MarketingFooter } from '../marketing/MarketingSections'

type Props = {
  children: ReactNode
  className?: string
  hideFooter?: boolean
}

export function PageShell({ children, className = 'bg-white', hideFooter }: Props) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <MainNavbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <MarketingFooter />}
    </div>
  )
}

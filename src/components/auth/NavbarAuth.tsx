import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { getPostAuthPath } from '../../lib/userRole'

const btnOutline =
  'inline-flex items-center justify-center px-4 py-2 rounded-full border-[3px] border-orange-100 text-sm font-semibold text-gray-800 hover:border-educture-orange hover:text-educture-orange transition-colors'

const btnPrimary =
  'inline-flex items-center justify-center px-4 py-2 rounded-full bg-educture-orange text-white text-sm font-semibold shadow-[0_8px_24px_rgba(243,112,33,0.35)] hover:bg-educture-orange-dark transition-colors'

function DashboardLink({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useUser()
  const to = getPostAuthPath(user)
  return (
    <Link
      to={to}
      className="text-sm font-semibold text-gray-600 hover:text-educture-orange"
      onClick={onNavigate}
    >
      Dashboard
    </Link>
  )
}

export function NavbarAuth({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const wrap = mobile ? 'flex flex-col gap-2 mt-2' : 'hidden lg:flex items-center gap-2 shrink-0'

  return (
    <div className={wrap}>
      <SignedOut>
        <Link to="/sign-in" className={mobile ? `${btnOutline} w-full` : btnOutline} onClick={onNavigate}>
          Sign In
        </Link>
        <Link to="/sign-up" className={mobile ? `${btnPrimary} w-full` : btnPrimary} onClick={onNavigate}>
          Sign Up
        </Link>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-3">
          <DashboardLink onNavigate={onNavigate} />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 ring-2 ring-educture-orange/25',
              },
            }}
          />
        </div>
      </SignedIn>
    </div>
  )
}

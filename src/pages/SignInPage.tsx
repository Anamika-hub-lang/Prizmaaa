import { Link, useLocation, Navigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'
import { SignIn, useAuth, useUser } from '@clerk/clerk-react'
import { clerkAppearance } from '../lib/clerkConfig'
import { getPostAuthPath } from '../lib/userRole'

export function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  if (isLoaded && isSignedIn) {
    const target = from && from !== '/sign-in' ? from : getPostAuthPath(user)
    return <Navigate to={target} replace />
  }
  return (
    <div className="min-h-screen bg-[#fff9f3] flex flex-col">
      <header className="px-4 sm:px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-educture-orange flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </span>
          <span className="font-bold text-lg text-[#1d1d1d]">Educture</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 sm:px-6 gap-10 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-1/2 flex flex-col justify-center text-left py-8"
        >
          <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em] mb-3">
            Welcome back
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1d] leading-tight mb-4">
            Log in to continue your learning journey
          </h1>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            Access your courses, live sessions, and mentor feedback from one place.
          </p>
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=80"
            alt=""
            className="rounded-2xl shadow-card w-full max-w-md object-cover aspect-[4/3] hidden sm:block"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-1/2 flex items-center justify-center"
        >
          <div className="w-full max-w-md mx-auto rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 shadow-sm">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/auth/callback"
              appearance={clerkAppearance}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

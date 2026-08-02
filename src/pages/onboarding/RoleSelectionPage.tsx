import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useState } from 'react'
import type { UserRole } from '../../types/auth'
import { saveUserRole } from '../../lib/saveUserRole'

const roles: {
  id: UserRole
  title: string
  description: string
  icon: typeof BookOpen
}[] = [
  {
    id: 'student',
    title: 'Student',
    description: 'Browse live classes, enroll, and track assignments.',
    icon: BookOpen,
  },
  {
    id: 'teacher',
    title: 'Teacher',
    description: 'Publish classes, free courses, Meet links, and assignments.',
    icon: Users,
  },
]

export function RoleSelectionPage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()
  const [selected, setSelected] = useState<UserRole | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!selected) return
    setError(null)
    setSaving(true)
    try {
      await saveUserRole(selected, getToken)
      await user?.reload()
      navigate('/onboarding/profile', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center mb-10"
        >
          <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em] mb-3">
            Step 1 of 2
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1d] mb-3">
            How will you use Educture?
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Choose a role for this account. You won&apos;t be asked again after you continue.
          </p>
        </motion.div>

        <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon
            const active = selected === role.id
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelected(role.id)}
                className={`text-left rounded-3xl border-[3px] p-6 transition-all ${
                  active
                    ? 'border-educture-orange bg-white shadow-[0_12px_40px_rgba(243,112,33,0.15)]'
                    : 'border-orange-100 bg-white hover:border-educture-orange/50'
                }`}
              >
                <span
                  className={`inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4 ${
                    active ? 'bg-educture-orange text-white' : 'bg-orange-50 text-educture-orange'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </span>
                <h2 className="text-xl font-bold text-[#1d1d1d] mb-2">{role.title}</h2>
                <p className="text-sm text-gray-500">{role.description}</p>
              </button>
            )
          })}
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 max-w-md text-center" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!selected || saving}
          onClick={() => void handleContinue()}
          className="px-8 py-3 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_8px_24px_rgba(243,112,33,0.35)] hover:bg-educture-orange-dark disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

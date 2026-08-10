import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/student(.*)',
  '/teacher(.*)',
  '/admin(.*)',
  '/counsellor(.*)',
  '/data-upload(.*)',
  '/onboarding(.*)',
  '/auth/callback(.*)',
])

const roleHome: Record<string, string> = {
  admin: '/admin',
  student: '/student',
  teacher: '/teacher',
  counsellor: '/counsellor',
  intern: '/data-upload',
}

function roleFromClaims(sessionClaims: Record<string, unknown> | null | undefined): string | null {
  if (!sessionClaims) return null
  const meta =
    (sessionClaims.publicMetadata as { role?: unknown } | undefined) ??
    (sessionClaims.metadata as { role?: unknown } | undefined)
  const role = meta?.role
  return typeof role === 'string' ? role : null
}

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return

  // Payment return must stay public so order_id survives before sign-in.
  if (req.nextUrl.pathname === '/student/payment/return') return

  const session = await auth.protect()
  const role = roleFromClaims(session.sessionClaims as Record<string, unknown> | undefined)
  const path = req.nextUrl.pathname

  if (!role) return

  const prefixRules: Array<{ prefix: string; allowed: string }> = [
    { prefix: '/admin', allowed: 'admin' },
    { prefix: '/student', allowed: 'student' },
    { prefix: '/teacher', allowed: 'teacher' },
    { prefix: '/counsellor', allowed: 'counsellor' },
    { prefix: '/data-upload', allowed: 'intern' },
  ]

  for (const rule of prefixRules) {
    if (!path.startsWith(rule.prefix)) continue
    if (role === 'admin' && rule.prefix === '/admin') return
    if (role === rule.allowed) return
    // Admin allowlist users may lack role claim — client RequireAdminRoute still gates /admin.
    if (rule.prefix === '/admin') return
    const home = roleHome[role]
    if (home && !path.startsWith(home)) {
      return NextResponse.redirect(new URL(home, req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

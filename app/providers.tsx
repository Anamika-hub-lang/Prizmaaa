'use client'

import { Suspense } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { MentorContentProvider } from '@/context/MentorContentContext'
import { UserProfileSync } from '@/components/auth/UserProfileSync'
import { ConfigErrorScreen } from '@/components/auth/ConfigErrorScreen'
import { clerkPublishableKey, isClerkConfigured } from '@/lib/clerkConfig'

export function Providers({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured) {
    return (
      <ConfigErrorScreen message="Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file (see .env.example)." />
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey!} afterSignOutUrl="/">
      <UserProfileSync />
      <MentorContentProvider>
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
              Loading…
            </div>
          }
        >
          {children}
        </Suspense>
      </MentorContentProvider>
    </ClerkProvider>
  )
}

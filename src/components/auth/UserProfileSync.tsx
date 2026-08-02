import { useAuth, useUser } from '@clerk/clerk-react'
import { useEffect, useRef } from 'react'
import { syncUserProfile } from '../../lib/syncUserProfile'

/**
 * Keeps Supabase `profiles` in sync when Clerk session user data changes (client-triggered).
 */
export function UserProfileSync() {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const lastKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isSignedIn || !user) {
      lastKeyRef.current = null
      return
    }

    const role = user.publicMetadata?.role ?? ''
    const syncKey = [
      user.id,
      user.fullName ?? '',
      user.primaryEmailAddressId ?? '',
      user.imageUrl ?? '',
      role,
    ].join('|')

    if (lastKeyRef.current === syncKey) return
    lastKeyRef.current = syncKey

    void syncUserProfile(getToken).catch((err) => {
      console.warn('[UserProfileSync]', err)
    })
  }, [
    isSignedIn,
    getToken,
    user,
    user?.id,
    user?.fullName,
    user?.primaryEmailAddressId,
    user?.imageUrl,
    user?.publicMetadata?.role,
  ])

  return null
}

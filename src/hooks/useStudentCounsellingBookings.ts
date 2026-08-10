import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { fetchMyCounsellingBookings, type CounsellingBooking } from '../lib/counsellingPayment'

export function useStudentCounsellingBookings() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [bookings, setBookings] = useState<CounsellingBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setBookings([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await fetchMyCounsellingBookings(getToken)
      setBookings(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load counselling sessions')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    if (!isLoaded) return
    void refresh()
  }, [isLoaded, refresh])

  return { bookings, loading, error, refresh }
}

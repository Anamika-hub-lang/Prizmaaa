import { useCallback, useEffect, useState } from 'react'
import {
  fetchUniversityReviews,
  subscribeUniversityReviews,
  type UniversityReview,
} from '../lib/universityReviews'

export function useUniversityReviews(universityId?: string) {
  const [reviews, setReviews] = useState<UniversityReview[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await fetchUniversityReviews(universityId)
    setReviews(data)
    setLoading(false)
  }, [universityId])

  useEffect(() => {
    void refresh()
    const unsub = subscribeUniversityReviews(() => {
      void refresh()
    })
    return unsub
  }, [refresh])

  return { reviews, loading, refresh }
}

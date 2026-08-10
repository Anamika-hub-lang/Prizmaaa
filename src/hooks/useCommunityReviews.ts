import { useCallback, useEffect, useState } from 'react'
import {
  fetchCommunityReviews,
  subscribeCommunityReviews,
  type CommunityReview,
} from '../lib/communityReviews'

export function useCommunityReviews() {
  const [reviews, setReviews] = useState<CommunityReview[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const rows = await fetchCommunityReviews()
    setReviews(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    return subscribeCommunityReviews(() => {
      void refresh()
    })
  }, [refresh])

  return { reviews, loading, refresh }
}

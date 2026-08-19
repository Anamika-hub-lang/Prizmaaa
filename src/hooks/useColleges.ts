import { useEffect, useState } from 'react'
import type { College } from '../lib/colleges/types'
import { collegeRepository } from '../lib/colleges'

let cached: College[] | null = null

export function useColleges() {
  const [colleges, setColleges] = useState<College[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    if (cached) return
    let cancelled = false
    collegeRepository.getAll().then((data) => {
      if (cancelled) return
      cached = data
      setColleges(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { colleges, loading }
}

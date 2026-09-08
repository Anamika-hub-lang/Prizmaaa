import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  fetchMyAssignmentSubmissions,
  type StudentSubmissionReview,
} from '../lib/studentAssignmentReviewApi'

/** The signed-in student's own submissions, keyed by assignment, with the mentor's decision. */
export function useStudentSubmissions() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [submissions, setSubmissions] = useState<StudentSubmissionReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setSubmissions([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setSubmissions(await fetchMyAssignmentSubmissions(getToken))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your submissions')
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    if (!isLoaded) return
    void refresh()
  }, [isLoaded, refresh])

  const byAssignment = useMemo(() => {
    const map = new Map<string, StudentSubmissionReview>()
    for (const item of submissions) {
      if (item.assignmentId) map.set(item.assignmentId, item)
    }
    return map
  }, [submissions])

  return { submissions, byAssignment, loading, error, refresh }
}

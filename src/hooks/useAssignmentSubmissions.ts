import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { fetchAssignmentSubmissions } from '../lib/mentorAssignmentAssetsApi'
import type { AssignmentStudentSubmission } from '../types/mentorContent'

/** Mentor-side submissions for one assignment, plus the enrolled headcount for completion rate. */
export function useAssignmentSubmissions(assignmentId: string | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [submissions, setSubmissions] = useState<AssignmentStudentSubmission[]>([])
  const [enrolledCount, setEnrolledCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!assignmentId || !isSignedIn) {
      setSubmissions([])
      setEnrolledCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAssignmentSubmissions(getToken, assignmentId)
      setSubmissions(result.submissions)
      setEnrolledCount(result.enrolledCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load submissions')
      setSubmissions([])
      setEnrolledCount(0)
    } finally {
      setLoading(false)
    }
  }, [assignmentId, getToken, isSignedIn])

  useEffect(() => {
    if (!isLoaded) return
    void refresh()
  }, [isLoaded, refresh])

  const applyReview = useCallback((updated: AssignmentStudentSubmission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }, [])

  return { submissions, enrolledCount, loading, error, refresh, applyReview }
}

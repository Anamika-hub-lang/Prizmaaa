import type { EnrolledCourse } from '../components/student/MyCourseCard'
import type { MentorAssignment } from '../types/mentorContent'

export function computeDashboardStats(
  courses: EnrolledCourse[],
  assignments: MentorAssignment[] = [],
  learningStreakDays = 0,
) {
  const ongoing = courses.filter((c) => c.status === 'ongoing')
  const completed = courses.filter((c) => c.status === 'completed')
  const draft = courses.filter((c) => c.status === 'draft')
  const onlineLive = courses.filter((c) => c.type === 'online' && c.status !== 'draft')
  const freeActive = courses.filter((c) => c.type === 'free' && c.status === 'ongoing')
  const progressCourses = courses.filter((c) => c.status === 'ongoing' || c.status === 'completed')
  const avgProgress =
    progressCourses.length > 0
      ? Math.round(
          progressCourses.reduce((sum, c) => sum + c.progress, 0) / progressCourses.length,
        )
      : 0

  const assignmentsDue = assignments.filter((a) => a.status === 'pending').length
  const assignmentsDone = assignments.filter((a) => a.status === 'submitted').length
  const liveThisWeek = ongoing.filter((c) => c.type === 'online').length

  return {
    totalEnrolled: courses.filter((c) => c.status !== 'draft').length,
    inProgress: ongoing.length,
    completed: completed.length,
    draft: draft.length,
    onlineClasses: onlineLive.length,
    freeCoursesActive: freeActive.length,
    avgProgress,
    assignmentsDue,
    assignmentsDone,
    liveSessionsThisWeek: liveThisWeek,
    learningStreakDays,
  }
}

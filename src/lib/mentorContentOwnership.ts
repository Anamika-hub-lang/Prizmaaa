import type { FreeCourse } from '../data/classCatalog'
import type { ManagedClass, MentorAssignment } from '../types/mentorContent'

const PLACEHOLDER_MENTOR_NAMES = new Set(['your name', 'mentor', ''])

export function mentorDisplayName(user: {
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
} | null | undefined): string {
  if (!user) return ''
  return (user.fullName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`).trim()
}

function namesMatch(a: string, b: string): boolean {
  const left = a.toLowerCase().trim()
  const right = b.toLowerCase().trim()
  if (!left || !right) return false
  if (left === right) return true
  const leftParts = left.split(/\s+/).filter(Boolean)
  const rightParts = right.split(/\s+/).filter(Boolean)
  return (
    left.includes(right) ||
    right.includes(left) ||
    (leftParts[0] != null && rightParts[0] != null && leftParts[0] === rightParts[0])
  )
}

function isLegacyPlaceholder(label: string): boolean {
  return PLACEHOLDER_MENTOR_NAMES.has(label.toLowerCase().trim())
}

export function classBelongsToMentor(
  item: ManagedClass,
  mentorClerkId: string,
  displayName: string,
  sharedClassIds: ReadonlySet<string> = new Set(),
): boolean {
  if (sharedClassIds.has(item.id)) return true
  if (item.mentorClerkId === mentorClerkId) return true
  if (item.mentorClerkId) return false
  const label = item.mentor.trim()
  if (!displayName) return true
  if (isLegacyPlaceholder(label)) return true
  return namesMatch(label, displayName)
}

export function isClassOwner(item: ManagedClass, mentorClerkId: string): boolean {
  return Boolean(mentorClerkId) && item.mentorClerkId === mentorClerkId
}

export function freeCourseBelongsToMentor(
  item: FreeCourse,
  mentorClerkId: string,
  displayName: string,
): boolean {
  if (item.mentorClerkId === mentorClerkId) return true
  if (item.mentorClerkId) return false
  const label = item.instructor.trim()
  if (!displayName) return true
  if (isLegacyPlaceholder(label)) return true
  return namesMatch(label, displayName)
}

export function assignmentBelongsToMentor(
  item: MentorAssignment,
  mentorClerkId: string,
  _displayName: string,
): boolean {
  if (item.mentorClerkId === mentorClerkId) return true
  if (item.mentorClerkId) return false
  // Legacy assignments without owner — show to current mentor until claimed.
  return true
}

export function legacyClassesToClaim(
  classes: ManagedClass[],
  mentorClerkId: string,
  displayName: string,
): ManagedClass[] {
  return classes.filter((c) => !c.mentorClerkId && classBelongsToMentor(c, mentorClerkId, displayName))
}

export function legacyFreeCoursesToClaim(
  courses: FreeCourse[],
  mentorClerkId: string,
  displayName: string,
): FreeCourse[] {
  return courses.filter((c) => !c.mentorClerkId && freeCourseBelongsToMentor(c, mentorClerkId, displayName))
}

export function legacyAssignmentsToClaim(
  items: MentorAssignment[],
  mentorClerkId: string,
  displayName: string,
): MentorAssignment[] {
  return items.filter((a) => !a.mentorClerkId && assignmentBelongsToMentor(a, mentorClerkId, displayName))
}

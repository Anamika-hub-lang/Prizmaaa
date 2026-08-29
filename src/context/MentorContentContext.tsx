'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { getUserRole } from '../lib/userRole'
import { resolveMentorImage } from '../lib/mentorAvatar'
import {
  classCategories,
  formatBrowsePricingSummary,
  getDefaultPriceForCategory,
  type FreeCourse,
  type ClassCategoryId,
} from '../data/classCatalog'
import type { ManagedClass, MentorAssignment } from '../types/mentorContent'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  fetchAllContent,
  insertClass,
  updateClassRow,
  deleteClassRow,
  insertFreeCourse,
  updateFreeCourseRow,
  deleteFreeCourseRow,
  insertAssignment,
  submitAssignmentRow,
  updateAssignmentRow,
  subscribeContentRealtime,
} from '../lib/supabaseContent'
import {
  assignmentBelongsToMentor,
  classBelongsToMentor,
  freeCourseBelongsToMentor,
  isClassOwner,
  legacyAssignmentsToClaim,
  legacyClassesToClaim,
  legacyFreeCoursesToClaim,
  mentorDisplayName,
} from '../lib/mentorContentOwnership'
import { fetchSharedClassIds } from '../lib/classCoMentorsApi'

export type { ManagedClass, MentorAssignment }

type MentorContentContextValue = {
  classes: ManagedClass[]
  myClasses: ManagedClass[]
  freeCourses: FreeCourse[]
  myFreeCourses: FreeCourse[]
  assignments: MentorAssignment[]
  myAssignments: MentorAssignment[]
  categories: typeof classCategories
  classPrice: string
  loading: boolean
  syncError: string | null
  isRealtime: boolean
  usingLocalData: boolean
  sharedClassIds: string[]
  isOwnerOfClass: (classId: string) => boolean
  addClass: (input: Omit<ManagedClass, 'id' | 'price'>) => void
  updateClass: (id: string, patch: Partial<ManagedClass>) => void
  removeClass: (id: string) => void
  setMeetForClass: (id: string, meetLink: string, nextSessionLabel: string) => void
  addFreeCourse: (input: Omit<FreeCourse, 'id'>) => void
  updateFreeCourse: (id: string, patch: Partial<FreeCourse>) => void
  removeFreeCourse: (id: string) => void
  addAssignment: (input: Omit<MentorAssignment, 'id' | 'status'>) => void
  updateAssignment: (id: string, patch: Partial<MentorAssignment>) => void
  submitAssignment: (id: string, studentNote?: string) => void
  getClassById: (id: string) => ManagedClass | undefined
  getClassesByCategory: (categoryId: ClassCategoryId) => ManagedClass[]
  publishedClasses: ManagedClass[]
  myPublishedClasses: ManagedClass[]
  refresh: () => Promise<void>
  refreshSharedClasses: () => Promise<void>
}

const MentorContentContext = createContext<MentorContentContextValue | null>(null)

export function MentorContentProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const { getToken } = useAuth()
  const mentorClerkId = user?.id ?? null
  const mentorName = mentorDisplayName(user)

  const [classes, setClasses] = useState<ManagedClass[]>([])
  const [freeCourses, setFreeCourses] = useState<FreeCourse[]>([])
  const [assignments, setAssignments] = useState<MentorAssignment[]>([])
  const [sharedClassIds, setSharedClassIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [usingLocalData, setUsingLocalData] = useState(false)

  const applyData = useCallback(
    (data: {
      classes: ManagedClass[]
      freeCourses: FreeCourse[]
      assignments: MentorAssignment[]
      dataSource?: 'supabase' | 'local'
    }) => {
      setClasses(data.classes)
      setFreeCourses(data.freeCourses)
      setAssignments(data.assignments)
      setUsingLocalData(data.dataSource === 'local')
    },
    [],
  )

  const refreshSharedClasses = useCallback(async () => {
    if (!mentorClerkId || getUserRole(user) !== 'teacher') {
      setSharedClassIds([])
      return
    }
    try {
      setSharedClassIds(await fetchSharedClassIds(getToken))
    } catch {
      setSharedClassIds([])
    }
  }, [mentorClerkId, user, getToken])

  const refresh = useCallback(async () => {
    try {
      setSyncError(null)
      const data = await fetchAllContent()
      applyData(data)
      await refreshSharedClasses()
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [applyData, refreshSharedClasses])

  useEffect(() => {
    refresh()
    const unsub = subscribeContentRealtime(() => {
      refresh()
    })
    return unsub
  }, [refresh])

  useEffect(() => {
    if (!mentorClerkId || usingLocalData) return

    const claimClasses = legacyClassesToClaim(classes, mentorClerkId, mentorName)
    const claimCourses = legacyFreeCoursesToClaim(freeCourses, mentorClerkId, mentorName)
    const claimAssignments = legacyAssignmentsToClaim(assignments, mentorClerkId, mentorName)

    const allUnclaimed = classes.length > 0 && classes.every((c) => !c.mentorClerkId)

    if (claimClasses.length === 0 && claimCourses.length === 0 && claimAssignments.length === 0) {
      if (allUnclaimed && classes.length > 0) {
        for (const c of classes) {
          setClasses((prev) =>
            prev.map((row) => (row.id === c.id ? { ...row, mentorClerkId: mentorClerkId } : row)),
          )
          void updateClassRow(c.id, { mentorClerkId: mentorClerkId })
        }
      }
      return
    }

    for (const c of claimClasses) {
      setClasses((prev) =>
        prev.map((row) => (row.id === c.id ? { ...row, mentorClerkId: mentorClerkId } : row)),
      )
      void updateClassRow(c.id, { mentorClerkId: mentorClerkId })
    }
    for (const c of claimCourses) {
      setFreeCourses((prev) =>
        prev.map((row) => (row.id === c.id ? { ...row, mentorClerkId: mentorClerkId } : row)),
      )
      void updateFreeCourseRow(c.id, { mentorClerkId: mentorClerkId })
    }
    for (const a of claimAssignments) {
      setAssignments((prev) =>
        prev.map((row) => (row.id === a.id ? { ...row, mentorClerkId: mentorClerkId } : row)),
      )
      void updateAssignmentRow(a.id, { mentorClerkId: mentorClerkId })
    }
  }, [classes, freeCourses, assignments, mentorClerkId, mentorName, usingLocalData])

  const addClass = useCallback(
    (input: Omit<ManagedClass, 'id' | 'price'>) => {
      const id = `class-${Date.now()}`
      const mentorImage = resolveMentorImage(
        input.mentorImage,
        user?.hasImage ? user.imageUrl : null,
      )
      const optimistic: ManagedClass = {
        ...input,
        mentorImage,
        id,
        price: getDefaultPriceForCategory(input.categoryId),
        published: input.published ?? true,
        mentorClerkId: mentorClerkId ?? input.mentorClerkId ?? null,
      }
      setClasses((prev) => [...prev, optimistic])
      insertClass(
        { ...input, mentorImage, mentorClerkId: mentorClerkId ?? undefined },
        id,
      ).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not add class')
        setClasses((prev) => prev.filter((c) => c.id !== id))
      })
    },
    [mentorClerkId, user?.hasImage, user?.imageUrl],
  )

  const updateClass = useCallback(
    (id: string, patch: Partial<ManagedClass>) => {
      setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      updateClassRow(id, patch).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not update class')
        refresh()
      })
    },
    [refresh],
  )

  const removeClass = useCallback(
    (id: string) => {
      if (!mentorClerkId) return
      const item = classes.find((c) => c.id === id)
      if (item && !isClassOwner(item, mentorClerkId)) {
        setSyncError('Only the class owner can remove this class.')
        return
      }
      setClasses((prev) => prev.filter((c) => c.id !== id))
      deleteClassRow(id).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not remove class')
        refresh()
      })
    },
    [refresh, mentorClerkId, classes],
  )

  const setMeetForClass = useCallback(
    (id: string, meetLink: string, nextSessionLabel: string) => {
      updateClass(id, { meetLink, nextSessionLabel })
    },
    [updateClass],
  )

  const addFreeCourse = useCallback(
    (input: Omit<FreeCourse, 'id'>) => {
      const id = `free-${Date.now()}`
      const optimistic = { ...input, id, mentorClerkId: mentorClerkId ?? null }
      setFreeCourses((prev) => [...prev, optimistic])
      insertFreeCourse({ ...input, mentorClerkId: mentorClerkId ?? undefined }, id).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not add free course')
        setFreeCourses((prev) => prev.filter((c) => c.id !== id))
      })
    },
    [mentorClerkId],
  )

  const updateFreeCourse = useCallback(
    (id: string, patch: Partial<FreeCourse>) => {
      setFreeCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      updateFreeCourseRow(id, patch).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not update course')
        refresh()
      })
    },
    [refresh],
  )

  const removeFreeCourse = useCallback(
    (id: string) => {
      setFreeCourses((prev) => prev.filter((c) => c.id !== id))
      deleteFreeCourseRow(id).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not remove course')
        refresh()
      })
    },
    [refresh],
  )

  const addAssignment = useCallback(
    (input: Omit<MentorAssignment, 'id' | 'status'>) => {
      const optimistic: MentorAssignment = { ...input, id: `asg-${Date.now()}`, status: 'pending' }
      setAssignments((prev) => [...prev, optimistic])
      insertAssignment({ ...input, mentorClerkId: mentorClerkId ?? undefined }).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not add assignment')
        refresh()
      })
    },
    [mentorClerkId, refresh],
  )

  const updateAssignment = useCallback(
    (id: string, patch: Partial<MentorAssignment>) => {
      setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
      updateAssignmentRow(id, patch).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not update assignment')
        refresh()
      })
    },
    [refresh],
  )

  const submitAssignment = useCallback(
    (id: string, studentNote?: string) => {
      const submittedAt = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'submitted',
                submittedAt,
                studentNote: studentNote?.trim() || a.studentNote,
                submittedBy: 'Student',
              }
            : a,
        ),
      )
      submitAssignmentRow(id, studentNote).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not submit assignment')
        refresh()
      })
    },
    [refresh],
  )

  const getClassById = useCallback(
    (id: string) => classes.find((c) => c.id === id && c.published),
    [classes],
  )

  const getClassesByCategory = useCallback(
    (categoryId: ClassCategoryId) =>
      classes.filter((c) => c.categoryId === categoryId && c.published),
    [classes],
  )

  const publishedClasses = useMemo(() => classes.filter((c) => c.published), [classes])

  const allClassesUnclaimed = useMemo(
    () => classes.length > 0 && classes.every((c) => !c.mentorClerkId),
    [classes],
  )

  const sharedClassIdSet = useMemo(() => new Set(sharedClassIds), [sharedClassIds])

  const myClasses = useMemo(() => {
    if (!mentorClerkId) return []
    if (allClassesUnclaimed) return classes
    return classes.filter((c) =>
      classBelongsToMentor(c, mentorClerkId, mentorName, sharedClassIdSet),
    )
  }, [classes, mentorClerkId, mentorName, allClassesUnclaimed, sharedClassIdSet])

  const isOwnerOfClass = useCallback(
    (classId: string) => {
      if (!mentorClerkId) return false
      const item = classes.find((c) => c.id === classId)
      return item ? isClassOwner(item, mentorClerkId) : false
    },
    [classes, mentorClerkId],
  )

  const myFreeCourses = useMemo(() => {
    if (!mentorClerkId) return []
    return freeCourses.filter((c) => freeCourseBelongsToMentor(c, mentorClerkId, mentorName))
  }, [freeCourses, mentorClerkId, mentorName])

  const myAssignments = useMemo(() => {
    if (!mentorClerkId) return []
    return assignments.filter((a) => assignmentBelongsToMentor(a, mentorClerkId, mentorName))
  }, [assignments, mentorClerkId, mentorName])

  const myPublishedClasses = useMemo(() => myClasses.filter((c) => c.published), [myClasses])

  const syncedPhotoRef = useRef<string | null>(null)
  const mentorPhoto = user?.hasImage ? user.imageUrl?.trim() ?? '' : ''

  useEffect(() => {
    if (loading || usingLocalData) return
    if (getUserRole(user) !== 'teacher' || !mentorClerkId || !mentorPhoto) return
    const key = `${mentorClerkId}:${mentorPhoto}`
    const stale = myClasses.filter((c) => c.mentorImage !== mentorPhoto)
    if (stale.length === 0) {
      syncedPhotoRef.current = key
      return
    }
    if (syncedPhotoRef.current === key) return
    syncedPhotoRef.current = key
    for (const c of stale) {
      setClasses((prev) =>
        prev.map((row) => (row.id === c.id ? { ...row, mentorImage: mentorPhoto } : row)),
      )
      void updateClassRow(c.id, { mentorImage: mentorPhoto })
    }
  }, [loading, usingLocalData, user, mentorClerkId, mentorPhoto, myClasses])

  const value = useMemo(
    () => ({
      classes,
      myClasses,
      freeCourses,
      myFreeCourses,
      assignments,
      myAssignments,
      categories: classCategories,
      classPrice: formatBrowsePricingSummary(),
      loading,
      syncError,
      isRealtime: isSupabaseConfigured && !usingLocalData,
      usingLocalData,
      addClass,
      updateClass,
      removeClass,
      setMeetForClass,
      addFreeCourse,
      updateFreeCourse,
      removeFreeCourse,
      addAssignment,
      updateAssignment,
      submitAssignment,
      getClassById,
      getClassesByCategory,
      publishedClasses,
      myPublishedClasses,
      sharedClassIds,
      isOwnerOfClass,
      refresh,
      refreshSharedClasses,
    }),
    [
      classes,
      myClasses,
      freeCourses,
      myFreeCourses,
      assignments,
      myAssignments,
      loading,
      syncError,
      usingLocalData,
      addClass,
      updateClass,
      removeClass,
      setMeetForClass,
      addFreeCourse,
      updateFreeCourse,
      removeFreeCourse,
      addAssignment,
      updateAssignment,
      submitAssignment,
      getClassById,
      getClassesByCategory,
      publishedClasses,
      myPublishedClasses,
      sharedClassIds,
      isOwnerOfClass,
      refresh,
      refreshSharedClasses,
    ],
  )

  return (
    <MentorContentContext.Provider value={value}>{children}</MentorContentContext.Provider>
  )
}

export function useMentorContent() {
  const ctx = useContext(MentorContentContext)
  if (!ctx) throw new Error('useMentorContent must be used within MentorContentProvider')
  return ctx
}

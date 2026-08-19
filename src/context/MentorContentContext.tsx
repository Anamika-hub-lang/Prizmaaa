import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useUser } from '@clerk/nextjs'
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
  refresh: () => Promise<void>
}

const MentorContentContext = createContext<MentorContentContextValue | null>(null)

export function MentorContentProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const mentorClerkId = user?.id ?? null

  const [classes, setClasses] = useState<ManagedClass[]>([])
  const [freeCourses, setFreeCourses] = useState<FreeCourse[]>([])
  const [assignments, setAssignments] = useState<MentorAssignment[]>([])
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

  const refresh = useCallback(async () => {
    try {
      setSyncError(null)
      const data = await fetchAllContent()
      applyData(data)
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [applyData])

  useEffect(() => {
    refresh()
    const unsub = subscribeContentRealtime(() => {
      refresh()
    })
    return unsub
  }, [refresh])

  const addClass = useCallback(
    (input: Omit<ManagedClass, 'id' | 'price'>) => {
      const id = `class-${Date.now()}`
      const optimistic: ManagedClass = {
        ...input,
        id,
        price: getDefaultPriceForCategory(input.categoryId),
        published: input.published ?? true,
        mentorClerkId: mentorClerkId ?? input.mentorClerkId ?? null,
      }
      setClasses((prev) => [...prev, optimistic])
      insertClass({ ...input, mentorClerkId: mentorClerkId ?? undefined }, id).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not add class')
        setClasses((prev) => prev.filter((c) => c.id !== id))
      })
    },
    [mentorClerkId],
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
      setClasses((prev) => prev.filter((c) => c.id !== id))
      deleteClassRow(id).catch((e) => {
        setSyncError(e instanceof Error ? e.message : 'Could not remove class')
        refresh()
      })
    },
    [refresh],
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

  const myClasses = useMemo(
    () => (mentorClerkId ? classes.filter((c) => c.mentorClerkId === mentorClerkId) : []),
    [classes, mentorClerkId],
  )

  const myFreeCourses = useMemo(
    () => (mentorClerkId ? freeCourses.filter((c) => c.mentorClerkId === mentorClerkId) : []),
    [freeCourses, mentorClerkId],
  )

  const myAssignments = useMemo(
    () => (mentorClerkId ? assignments.filter((a) => a.mentorClerkId === mentorClerkId) : []),
    [assignments, mentorClerkId],
  )

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
      refresh,
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
      refresh,
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

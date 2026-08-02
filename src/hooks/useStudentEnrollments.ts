import { useCallback, useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'
import { TRIAL_DAYS } from '../data/pricingPlans'
import {
  applyTrialBillingRules,
  maskPaymentLabel,
  trialEndDateFromNow,
} from '../lib/enrollmentBilling'
import {
  assertCanEnrollInClass,
  getActiveEnrollmentForClass,
} from '../lib/classEnrollmentPolicy'
import { enrollmentFromRow, type EnrollmentRow, type PaymentMethodType, type StudentEnrollment } from '../types/enrollment'

const LOCAL_KEY = 'educture_student_enrollments'

function readLocal(clerkId: string): StudentEnrollment[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const all = JSON.parse(raw) as StudentEnrollment[]
    return all.filter((e) => e.clerkId === clerkId)
  } catch {
    return []
  }
}

function writeLocalForClerk(clerkId: string, rows: StudentEnrollment[]) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const all = (raw ? JSON.parse(raw) : []) as StudentEnrollment[]
    const rest = all.filter((e) => e.clerkId !== clerkId)
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...rest, ...rows]))
  } catch {
    /* ignore */
  }
}

async function patchEnrollmentDb(
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('student_enrollments').update(patch).eq('id', id)
  if (error) throw enrollmentDbError(error)
}

type PostgrestErr = { message?: string; code?: string }

function enrollmentDbError(error: PostgrestErr): Error {
  const msg = error.message ?? 'Could not save enrollment'
  if (error.code === '42703' || msg.includes('billing_status') || msg.includes('trial_ends_at')) {
    return new Error(
      'Trial billing is not set up in Supabase. Run supabase/enrollment-billing.sql in the SQL Editor, then try again.',
    )
  }
  if (error.code === '23503') {
    return new Error(
      'This class is not in the database yet. Your mentor should save/publish the class again, then retry.',
    )
  }
  if (error.code === '23505') {
    return new Error('You already have an enrollment for this class — check your dashboard.')
  }
  return new Error(msg)
}

async function upsertClassEnrollment(
  clerkId: string,
  classId: string,
  row: Record<string, unknown>,
): Promise<void> {
  if (!supabase) throw new Error('Supabase required')
  const existing = await supabase
    .from('student_enrollments')
    .select('id, billing_status, status, plan_tier')
    .eq('clerk_id', clerkId)
    .eq('class_id', classId)
    .maybeSingle()

  if (existing.error) throw enrollmentDbError(existing.error)

  if (existing.data?.id) {
    const active =
      existing.data.billing_status !== 'cancelled' && existing.data.status !== 'draft' &&
      (existing.data.billing_status === 'trial' ||
        existing.data.billing_status === 'active' ||
        existing.data.status === 'ongoing')
    if (active) {
      const tier = existing.data.plan_tier as string | null
      const label =
        tier === 'trial'
          ? 'Starter trial'
          : tier === 'monthly'
            ? 'Growth (monthly)'
            : tier === 'three-month'
              ? 'Premium (3 months)'
              : 'your current plan'
      throw new Error(
        `You are already enrolled on ${label} for this class. Cancel from your dashboard first, then you can pick a different plan.`,
      )
    }
    const { error } = await supabase.from('student_enrollments').update(row).eq('id', existing.data.id)
    if (error) throw enrollmentDbError(error)
  } else {
    const { error } = await supabase.from('student_enrollments').insert(row)
    if (error) throw enrollmentDbError(error)
  }
}

async function insertEnrollmentRow(row: Record<string, unknown>): Promise<StudentEnrollment> {
  if (!supabase) throw new Error('Supabase required')
  const { data, error } = await supabase.from('student_enrollments').insert(row).select().single()
  if (error) throw enrollmentDbError(error)
  return enrollmentFromRow(data as EnrollmentRow)
}

export async function fetchEnrollmentsForClerk(clerkId: string): Promise<StudentEnrollment[]> {
  if (!supabase) {
    return applyTrialBillingRules(readLocal(clerkId))
  }

  const { data, error } = await supabase
    .from('student_enrollments')
    .select('*')
    .eq('clerk_id', clerkId)
    .order('enrolled_at', { ascending: true })

  if (error) {
    console.warn('[enrollments] fetch failed', error.message)
    return applyTrialBillingRules(readLocal(clerkId))
  }

  let rows = (data ?? []).map((r: EnrollmentRow) => enrollmentFromRow(r))
  const afterRules = applyTrialBillingRules(rows)
  for (let i = 0; i < rows.length; i++) {
    const before = rows[i]
    const after = afterRules[i]
    if (
      before.billingStatus !== after.billingStatus ||
      before.planTier !== after.planTier ||
      before.status !== after.status
    ) {
      await patchEnrollmentDb(after.id, {
        billing_status: after.billingStatus,
        plan_tier: after.planTier,
        status: after.status,
      })
    }
  }
  return afterRules
}

export function useStudentEnrollments() {
  const { user } = useUser()
  const clerkId = user?.id
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!clerkId) {
      setEnrollments([])
      setLoading(false)
      return
    }
    const rows = await fetchEnrollmentsForClerk(clerkId)
    setEnrollments(rows)
    setLoading(false)
  }, [clerkId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!clerkId || !supabase) return
    const client = supabase
    const channel = client
      .channel(`enrollments-${clerkId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_enrollments',
          filter: `clerk_id=eq.${clerkId}`,
        },
        () => void refresh(),
      )
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [clerkId, refresh])

  const enrollInClass = useCallback(
    async (classId: string, planTier?: string) => {
      if (!clerkId) return
      assertCanEnrollInClass(enrollments, classId)
      const tier = planTier ?? 'monthly'
      const row = {
        clerk_id: clerkId,
        class_id: classId,
        kind: 'online',
        progress: 0,
        status: 'ongoing',
        plan_tier: tier,
        billing_status: 'active',
        auto_renew: true,
      }
      if (!supabase) {
        const local = readLocal(clerkId)
        const without = local.filter((e) => e.classId !== classId)
        writeLocalForClerk(clerkId, [
          ...without,
          {
            id: local.find((e) => e.classId === classId)?.id ?? `enr-${Date.now()}`,
            clerkId,
            classId,
            freeCourseId: null,
            kind: 'online',
            progress: local.find((e) => e.classId === classId)?.progress ?? 0,
            status: 'ongoing',
            planTier: tier,
            enrolledAt: local.find((e) => e.classId === classId)?.enrolledAt ?? new Date().toISOString(),
            billingStatus: 'active',
            trialEndsAt: null,
            paymentMethodType: null,
            paymentMethodLabel: null,
            autoRenew: true,
          },
        ])
      } else {
        await upsertClassEnrollment(clerkId, classId, row)
      }
      await refresh()
    },
    [clerkId, refresh, enrollments],
  )

  const enrollWithPaidPlan = useCallback(
    async (
      classId: string,
      planTier: 'monthly' | 'three-month',
      paymentMethodType: PaymentMethodType,
      paymentRaw: string,
    ) => {
      if (!clerkId) return
      assertCanEnrollInClass(enrollments, classId)
      const label = maskPaymentLabel(paymentMethodType, paymentRaw)
      const row = {
        clerk_id: clerkId,
        class_id: classId,
        kind: 'online',
        progress: 0,
        status: 'ongoing',
        plan_tier: planTier,
        billing_status: 'active',
        trial_ends_at: null,
        payment_method_type: paymentMethodType,
        payment_method_label: label,
        auto_renew: true,
      }
      if (!supabase) {
        const local = readLocal(clerkId)
        const prev = local.find((e) => e.classId === classId)
        writeLocalForClerk(clerkId, [
          ...local.filter((e) => e.classId !== classId),
          {
            id: prev?.id ?? `enr-${Date.now()}`,
            clerkId,
            classId,
            freeCourseId: null,
            kind: 'online',
            progress: prev?.progress ?? 0,
            status: 'ongoing',
            planTier,
            enrolledAt: prev?.enrolledAt ?? new Date().toISOString(),
            billingStatus: 'active',
            trialEndsAt: null,
            paymentMethodType,
            paymentMethodLabel: label,
            autoRenew: true,
          },
        ])
      } else {
        await upsertClassEnrollment(clerkId, classId, row)
      }
      await refresh()
    },
    [clerkId, refresh, enrollments],
  )

  const startTrialWithPayment = useCallback(
    async (
      classId: string,
      paymentMethodType: PaymentMethodType,
      paymentRaw: string
    ) => {
      if (!clerkId) throw new Error('Sign in required to start a trial.')
      assertCanEnrollInClass(enrollments, classId)
      const label = maskPaymentLabel(paymentMethodType, paymentRaw)
      const row = {
        clerk_id: clerkId,
        class_id: classId,
        kind: 'online',
        progress: 0,
        status: 'ongoing',
        plan_tier: 'trial',
        billing_status: 'trial',
        trial_ends_at: trialEndDateFromNow(),
        payment_method_type: paymentMethodType,
        payment_method_label: label,
        auto_renew: true,
      }
      if (!supabase) {
        const local = readLocal(clerkId)
        writeLocalForClerk(clerkId, [
          ...local.filter((e) => e.classId !== classId),
          {
            id: `enr-${Date.now()}`,
            clerkId,
            classId,
            freeCourseId: null,
            kind: 'online',
            progress: 0,
            status: 'ongoing',
            planTier: 'trial',
            enrolledAt: new Date().toISOString(),
            billingStatus: 'trial',
            trialEndsAt: trialEndDateFromNow(),
            paymentMethodType,
            paymentMethodLabel: label,
            autoRenew: true,
          },
        ])
      } else {
        await upsertClassEnrollment(clerkId, classId, row)
      }
      await refresh()
    },
    [clerkId, refresh, enrollments],
  )

  const cancelEnrollment = useCallback(
    async (enrollmentId: string) => {
      const patch = {
        billing_status: 'cancelled',
        auto_renew: false,
        status: 'draft',
      }
      if (supabase) await patchEnrollmentDb(enrollmentId, patch)
      else if (clerkId) {
        const local = readLocal(clerkId).map((e) =>
          e.id === enrollmentId
            ? {
                ...e,
                billingStatus: 'cancelled' as const,
                autoRenew: false,
                status: 'draft' as const,
              }
            : e,
        )
        writeLocalForClerk(clerkId, local)
      }
      await refresh()
    },
    [clerkId, refresh],
  )

  const updateEnrollmentProgress = useCallback(
    async (enrollmentId: string, progress: number) => {
      const p = Math.min(100, Math.max(0, progress))
      if (supabase) await patchEnrollmentDb(enrollmentId, { progress: p })
      else if (clerkId) {
        const local = readLocal(clerkId).map((e) =>
          e.id === enrollmentId ? { ...e, progress: p } : e,
        )
        writeLocalForClerk(clerkId, local)
      }
      await refresh()
    },
    [clerkId, refresh],
  )

  const enrollInFreeCourse = useCallback(
    async (freeCourseId: string) => {
      if (!clerkId) return
      const row = {
        clerk_id: clerkId,
        free_course_id: freeCourseId,
        kind: 'free',
        progress: 0,
        status: 'ongoing',
      }
      if (!supabase) {
        const local = readLocal(clerkId)
        writeLocalForClerk(clerkId, [
          ...local,
          {
            id: `enr-${Date.now()}`,
            clerkId,
            classId: null,
            freeCourseId,
            kind: 'free',
            progress: 0,
            status: 'ongoing',
            planTier: null,
            enrolledAt: new Date().toISOString(),
            billingStatus: null,
            trialEndsAt: null,
            paymentMethodType: null,
            paymentMethodLabel: null,
            autoRenew: true,
          },
        ])
      } else {
        await insertEnrollmentRow(row)
      }
      await refresh()
    },
    [clerkId, refresh],
  )

  return {
    enrollments,
    loading,
    refresh,
    getActiveClassEnrollment: (classId: string) => getActiveEnrollmentForClass(enrollments, classId),
    enrollInClass,
    enrollWithPaidPlan,
    enrollInFreeCourse,
    startTrialWithPayment,
    cancelEnrollment,
    updateEnrollmentProgress,
    trialDays: TRIAL_DAYS,
  }
}

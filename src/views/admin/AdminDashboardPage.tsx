'use client'

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import {
  Building2,
  CalendarCheck,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  UserPlus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'
import { fetchAdminCounsellingBookings } from '../../lib/adminCounselling'
import { fetchAdminUploads, fetchAdminUsers } from '../../lib/adminDashboardApi'
import { fetchAdminEnrollments } from '../../lib/adminEnrollments'
import { fetchMentorApplications } from '../../lib/adminMentors'
import { fetchPartners, fetchStaffLeads } from '../../lib/universityLeadsApi'

type StatCard = {
  to: string
  label: string
  value: number | string
  icon: LucideIcon
  tint: number
}

export function AdminDashboardPage() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState<StatCard[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [users, bookings, enrollments, uploadsRes, mentors, leads, partners] = await Promise.all([
        fetchAdminUsers(getToken).catch(() => []),
        fetchAdminCounsellingBookings(getToken).catch(() => []),
        fetchAdminEnrollments(getToken).catch(() => []),
        fetchAdminUploads(getToken).catch(() => ({ uploads: [] })),
        fetchMentorApplications(getToken).catch(() => []),
        fetchStaffLeads(getToken, false).catch(() => []),
        fetchPartners(getToken).catch(() => []),
      ])

      const paidBookings = bookings.filter((b) => b.paymentStatus === 'paid').length
      const newLeads = leads.filter((l) => l.status === 'NEW').length
      const pendingUploads = uploadsRes.uploads.filter((u) => u.status === 'pending').length
      const pendingMentors = mentors.filter((m) => m.status === 'pending').length

      setStats([
        { to: '/admin/users', label: 'Users', value: users.length, icon: Users, tint: 0 },
        {
          to: '/admin/enrollments',
          label: 'Enrollments',
          value: enrollments.length,
          icon: GraduationCap,
          tint: 1,
        },
        {
          to: '/admin/counselling?status=paid',
          label: 'Paid bookings',
          value: paidBookings,
          icon: CalendarCheck,
          tint: 2,
        },
        {
          to: '/admin/leads',
          label: 'New leads',
          value: newLeads,
          icon: ClipboardList,
          tint: 3,
        },
        {
          to: '/admin/uploads',
          label: 'CSV pending',
          value: pendingUploads,
          icon: FileSpreadsheet,
          tint: 4,
        },
        {
          to: '/admin/mentors',
          label: 'Mentor requests',
          value: pendingMentors,
          icon: UserPlus,
          tint: 5,
        },
        {
          to: '/admin/partners',
          label: 'Partners',
          value: partners.length,
          icon: Building2,
          tint: 0,
        },
        {
          to: '/admin/leads',
          label: 'Total leads',
          value: leads.length,
          icon: ClipboardList,
          tint: 1,
        },
      ])
    } catch {
      setStats([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div>
      <AdminPageHeader title="Admin overview" subtitle="Key numbers — open any card for details." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-orange-50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              const tint = dashboardTint(stat.tint)
              return (
                <Link
                  key={`${stat.to}-${stat.label}`}
                  to={stat.to}
                  className={`${dashboardCardBorder} ${tint.bg} ${tint.border} rounded-2xl p-5 text-left hover:brightness-[0.98] transition`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {stat.label}
                    </p>
                    <Icon className="w-4 h-4 text-educture-orange shrink-0" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#1d1d1d] tabular-nums">{stat.value}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

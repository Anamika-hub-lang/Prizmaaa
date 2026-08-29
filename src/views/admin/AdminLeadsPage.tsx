'use client'

import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { StaffUniversityLeadsPage } from '../leads/StaffUniversityLeadsPage'

export function AdminLeadsPage() {
  return (
    <StaffUniversityLeadsPage
      asCounsellor={false}
      header={
        <AdminPageHeader
          title="University leads"
          subtitle="Students who asked for counselling, marked interest, or requested an application. Phone is staff-only."
        />
      }
    />
  )
}

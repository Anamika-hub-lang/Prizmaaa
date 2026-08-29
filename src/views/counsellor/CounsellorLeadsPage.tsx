'use client'

import { CounsellorPageHeader } from '../../components/layout/CounsellorLayout'
import { StaffUniversityLeadsPage } from '../leads/StaffUniversityLeadsPage'

export function CounsellorLeadsPage() {
  return (
    <StaffUniversityLeadsPage
      asCounsellor
      header={
        <CounsellorPageHeader
          title="Assigned university leads"
          subtitle="Update status, add notes, and schedule follow-ups for students assigned to you."
        />
      }
    />
  )
}

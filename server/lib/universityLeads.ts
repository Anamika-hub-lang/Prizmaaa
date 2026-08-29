import type { UniversityLeadSource, UniversityLeadStatus } from '../../src/data/universityLeadFields'
import {
  isUniversityLeadSource,
  isUniversityLeadStatus,
} from '../../src/data/universityLeadFields'

export { isUniversityLeadSource, isUniversityLeadStatus }

export type UniversityLeadRow = {
  id: string
  clerk_id: string | null
  full_name: string
  phone: string
  email: string
  course: string
  preferred_location: string | null
  qualification: string
  university_id: string
  university_name: string
  source: UniversityLeadSource
  status: UniversityLeadStatus
  assigned_counsellor_clerk_id: string | null
  share_consent: boolean
  follow_up_at: string | null
  created_at: string
  updated_at: string
}

export type UniversityLeadPublic = Omit<UniversityLeadRow, 'phone'> & {
  phone?: string
}

export function mapLeadRow(row: Record<string, unknown>, includePhone: boolean): UniversityLeadPublic {
  const lead: UniversityLeadPublic = {
    id: String(row.id),
    clerk_id: (row.clerk_id as string | null) ?? null,
    full_name: String(row.full_name ?? ''),
    email: String(row.email ?? ''),
    course: String(row.course ?? ''),
    preferred_location: (row.preferred_location as string | null) ?? null,
    qualification: String(row.qualification ?? ''),
    university_id: String(row.university_id ?? ''),
    university_name: String(row.university_name ?? ''),
    source: isUniversityLeadSource(row.source) ? row.source : 'interested',
    status: isUniversityLeadStatus(row.status) ? row.status : 'NEW',
    assigned_counsellor_clerk_id: (row.assigned_counsellor_clerk_id as string | null) ?? null,
    share_consent: Boolean(row.share_consent),
    follow_up_at: (row.follow_up_at as string | null) ?? null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  }
  if (includePhone) lead.phone = String(row.phone ?? '')
  return lead
}

export function leadMatchesPartner(
  lead: { university_id: string; course: string; preferred_location: string | null },
  partner: { university_id: string; location: string | null; state: string | null },
  programNames: string[],
): boolean {
  if (lead.university_id !== partner.university_id) return false
  if (programNames.length > 0 && lead.course && lead.course !== 'Undecided / need counselling') {
    const wanted = lead.course.toLowerCase()
    const overlap = programNames.some(
      (name) => name.toLowerCase().includes(wanted) || wanted.includes(name.toLowerCase()),
    )
    if (!overlap) return false
  }
  const loc = lead.preferred_location?.trim().toLowerCase()
  if (loc) {
    const partnerLoc = `${partner.location ?? ''} ${partner.state ?? ''}`.toLowerCase()
    if (partnerLoc.trim() && !partnerLoc.includes(loc) && !loc.includes((partner.location ?? '').toLowerCase())) {
      return false
    }
  }
  return true
}

export function isMissingUniversityLeadsTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('could not find the table')
}

export const MISSING_LEADS_SQL =
  'University leads tables are missing. Run supabase/university-leads.sql in the Supabase SQL Editor.'

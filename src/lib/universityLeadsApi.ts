import type {
  UniversityLeadSource,
  UniversityLeadStatus,
} from '../data/universityLeadFields'

export type UniversityLead = {
  id: string
  clerk_id: string | null
  full_name: string
  phone?: string
  email: string
  course: string
  preferred_location: string | null
  qualification: string
  university_id: string
  university_name: string
  source: UniversityLeadSource
  status: UniversityLeadStatus
  assigned_counsellor_clerk_id: string | null
  assignedCounsellorName?: string | null
  sharedWithPartner?: boolean
  share_consent: boolean
  follow_up_at: string | null
  created_at: string
  updated_at: string
}

export type CreateLeadInput = {
  fullName: string
  phone: string
  email: string
  course: string
  preferredLocation: string
  qualification: string
  universityId: string
  universityName: string
  source: UniversityLeadSource
  shareConsent: boolean
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(res.ok ? 'Invalid server response' : text.slice(0, 120) || `API error (${res.status})`)
  }
}

export async function submitUniversityLead(
  getToken: () => Promise<string | null>,
  input: CreateLeadInput,
): Promise<{ duplicate: boolean; message: string; lead: UniversityLead }> {
  const token = await getToken()
  const res = await fetch('/api/university-leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error((data.error as string | undefined) ?? 'Could not submit request')
  return {
    duplicate: Boolean(data.duplicate),
    message: String(data.message ?? 'Submitted'),
    lead: data.lead as UniversityLead,
  }
}

async function authFetch(path: string, getToken: () => Promise<string | null>, init?: RequestInit) {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error((data.error as string | undefined) ?? `API error (${res.status})`)
  return data
}

export async function fetchStaffLeads(
  getToken: () => Promise<string | null>,
  asCounsellor: boolean,
): Promise<UniversityLead[]> {
  const path = asCounsellor ? '/api/counsellor/university-leads' : '/api/admin/university-leads'
  const data = await authFetch(path, getToken)
  return (data.leads as UniversityLead[]) ?? []
}

export async function patchStaffLead(
  getToken: () => Promise<string | null>,
  leadId: string,
  body: {
    status?: UniversityLeadStatus
    followUpAt?: string | null
    assignedCounsellorClerkId?: string | null
  },
  asCounsellor: boolean,
): Promise<UniversityLead> {
  const base = asCounsellor ? '/api/counsellor/university-leads' : '/api/admin/university-leads'
  const data = await authFetch(`${base}/${leadId}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data.lead as UniversityLead
}

export async function fetchLeadNotes(getToken: () => Promise<string | null>, leadId: string, asCounsellor: boolean) {
  const base = asCounsellor ? '/api/counsellor/university-leads' : '/api/admin/university-leads'
  const data = await authFetch(`${base}/${leadId}/notes`, getToken)
  return (data.notes as Array<{ id: string; body: string; author_clerk_id: string; created_at: string }>) ?? []
}

export async function addLeadNote(
  getToken: () => Promise<string | null>,
  leadId: string,
  body: string,
  asCounsellor: boolean,
) {
  const base = asCounsellor ? '/api/counsellor/university-leads' : '/api/admin/university-leads'
  await authFetch(`${base}/${leadId}/notes`, getToken, { method: 'POST', body: JSON.stringify({ body }) })
}

export async function shareLeadWithPartner(getToken: () => Promise<string | null>, leadId: string) {
  await authFetch(`/api/admin/university-leads/${leadId}/share`, getToken, { method: 'POST' })
}

export type UniversityPartner = {
  id: string
  university_id: string
  name: string
  short_name: string | null
  location: string | null
  state: string | null
  website: string | null
  admission_info: string | null
  is_active: boolean
  clerk_id: string | null
  lead_commission_inr: number
  admission_commission_inr: number
  created_at: string
  stats?: { leads: number; applications: number; admissions: number; shared: number }
}

export async function fetchPartners(getToken: () => Promise<string | null>): Promise<UniversityPartner[]> {
  const data = await authFetch('/api/admin/university-partners', getToken)
  return (data.partners as UniversityPartner[]) ?? []
}

export async function createPartner(
  getToken: () => Promise<string | null>,
  body: Record<string, unknown>,
): Promise<UniversityPartner> {
  const data = await authFetch('/api/admin/university-partners', getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data.partner as UniversityPartner
}

export async function patchPartner(
  getToken: () => Promise<string | null>,
  id: string,
  body: Record<string, unknown>,
): Promise<UniversityPartner> {
  const data = await authFetch(`/api/admin/university-partners/${id}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data.partner as UniversityPartner
}

export async function fetchPartnerPrograms(getToken: () => Promise<string | null>, partnerId: string) {
  const data = await authFetch(`/api/admin/university-partners/${partnerId}/programs`, getToken)
  return (data.programs as Array<{
    id: string
    name: string
    fees_inr: number | null
    eligibility: string | null
    duration: string | null
  }>) ?? []
}

export async function addPartnerProgram(
  getToken: () => Promise<string | null>,
  partnerId: string,
  body: Record<string, unknown>,
) {
  await authFetch(`/api/admin/university-partners/${partnerId}/programs`, getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export type UniversityCommission = {
  id: string
  lead_id: string
  partner_id: string | null
  university_id: string
  application_status: string
  admission_status: string
  commission_amount_inr: number
  commission_status: string
  payment_received_at: string | null
  created_at: string
}

export async function fetchCommissions(getToken: () => Promise<string | null>): Promise<UniversityCommission[]> {
  const data = await authFetch('/api/admin/university-commissions', getToken)
  return (data.commissions as UniversityCommission[]) ?? []
}

export async function patchCommission(
  getToken: () => Promise<string | null>,
  body: {
    id: string
    commissionStatus?: string
    paymentReceivedAt?: string | null
    commissionAmountInr?: number
  },
) {
  await authFetch('/api/admin/university-commissions', getToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export type PartnerProgram = {
  id: string
  name: string
  fees_inr: number | null
  eligibility: string | null
  duration: string | null
}

export async function fetchPartnerMe(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/partner/me', getToken)
  return {
    partner: data.partner as UniversityPartner,
    programs: (data.programs as PartnerProgram[]) ?? [],
  }
}

export async function fetchPartnerDashboard(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/partner/leads', getToken)
  return {
    stats: (data.stats as { leads: number; applications: number; admissions: number; shared: number }) ?? {
      leads: 0,
      applications: 0,
      admissions: 0,
      shared: 0,
    },
    leads: (data.leads as UniversityLead[]) ?? [],
  }
}

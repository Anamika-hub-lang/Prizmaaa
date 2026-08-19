import { parseOpportunityMatchPayload } from '../../server/lib/geminiClient'

export async function reviewResumeWithAi(resumeText: string): Promise<{ result: string }> {
  const res = await fetch('/api/ai/resume-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText }),
  })

  const data = (await res.json()) as { result?: string; error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? 'Could not analyze resume')
  }
  if (!data.result) {
    throw new Error('Invalid AI response')
  }
  return { result: data.result }
}

export type OpportunityProfile = {
  stream: string
  year: string
  skills: string
  goals?: string
}

export type OpportunityMatchItem = {
  type: string
  name: string
  company: string
  role: string
  location: string
  why: string
  apply: string
  applyUrl: string
  logoUrl: string
}

export type OpportunityMatchResult = {
  snapshot: string
  matches: OpportunityMatchItem[]
  next: string[]
  fallbackMarkdown?: string
}

export async function matchOpportunitiesWithAi(profile: OpportunityProfile): Promise<OpportunityMatchResult> {
  const res = await fetch('/api/ai/opportunity-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })

  const data = (await res.json()) as OpportunityMatchResult & { result?: string; error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? 'Could not match opportunities')
  }

  const parsed = normalizeOpportunityResult(data)
  if (parsed.matches.length > 0) return parsed

  const raw = String(data.fallbackMarkdown ?? data.result ?? '').trim()
  if (raw) {
    const recovered = parseOpportunityMatchPayload(raw)
    if (recovered.matches.length > 0) return recovered
  }

  if (parsed.snapshot) return parsed
  throw new Error('Could not read AI matches. Try again.')
}

function normalizeOpportunityResult(
  data: OpportunityMatchResult & { result?: string; error?: string },
): OpportunityMatchResult {
  const matches = Array.isArray(data.matches)
    ? data.matches
        .map((item) => {
          const row = item as OpportunityMatchItem & { title?: string }
          const applyUrl = String(row?.applyUrl ?? '').trim() || (/^https?:\/\//i.test(String(row?.apply ?? '')) ? String(row.apply).trim() : '')
          return {
            type: String(row?.type ?? '').trim() || 'Opportunity',
            name: String(row?.name ?? row?.title ?? row?.role ?? '').trim(),
            company: String(row?.company ?? '').trim(),
            role: String(row?.role ?? row?.name ?? '').trim(),
            location: String(row?.location ?? '').trim(),
            why: String(row?.why ?? '').trim(),
            apply: applyUrl || String(row?.apply ?? '').trim(),
            applyUrl,
            logoUrl: String(row?.logoUrl ?? '').trim(),
          }
        })
        .filter((item) => {
          if (!item.company || !item.applyUrl) return false
          try {
            const host = new URL(item.applyUrl).hostname.replace(/^www\./i, '').toLowerCase()
            const blocked = [
              'unstop.com',
              'dare2compete.com',
              'internshala.com',
              'naukri.com',
              'indeed.com',
              'indeed.co.in',
              'linkedin.com',
              'glassdoor.com',
              'wellfound.com',
              'shine.com',
              'foundit.in',
              'cutshort.io',
              'instahyre.com',
            ]
            return !blocked.some((listed) => host === listed || host.endsWith(`.${listed}`))
          } catch {
            return false
          }
        })
    : []
  const next = Array.isArray(data.next) ? data.next.map((item) => String(item).trim()).filter(Boolean) : []
  const snapshot = String(data.snapshot ?? '').trim()
  const raw = String(data.fallbackMarkdown ?? data.result ?? '').trim()

  if (matches.length > 0) {
    return { snapshot, matches, next }
  }

  if (raw.startsWith('{') || raw.startsWith('[')) {
    const recovered = parseOpportunityMatchPayload(raw)
    if (recovered.matches.length > 0) return recovered
    return { snapshot: snapshot || recovered.snapshot, matches: [], next }
  }

  return {
    snapshot,
    matches,
    next,
    fallbackMarkdown: raw && !raw.startsWith('{') ? raw : undefined,
  }
}

export async function parseOpportunityVoice(input: {
  transcript?: string
  audioBase64?: string
  mimeType?: string
}): Promise<OpportunityProfile> {
  const res = await fetch('/api/ai/opportunity-voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const data = (await res.json()) as OpportunityProfile & { error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? 'Could not read your voice note')
  }
  return {
    stream: data.stream ?? '',
    year: data.year ?? '',
    skills: data.skills ?? '',
    goals: data.goals ?? '',
  }
}

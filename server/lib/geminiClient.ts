const GEMINI_MODEL = 'gemini-2.5-flash'
const MAX_INPUT_CHARS = 12_000

export type GeminiGenerateOptions = {
  json?: boolean
  search?: boolean
  maxOutputTokens?: number
  temperature?: number
}

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

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

export type OpportunityMatchPayload = {
  snapshot: string
  matches: OpportunityMatchItem[]
  next: string[]
  fallbackMarkdown?: string
}

export type VoiceProfilePayload = {
  stream: string
  year: string
  skills: string
  goals: string
}

export function truncateForAi(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}\n\n[truncated for length]`
}

export function parseGeminiJson<T>(text: string): T {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(stripped) as T
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function normKey(key: string): string {
  return key.toLowerCase().replace(/[\s_/\-.:]+/g, '')
}

function pickString(obj: Record<string, unknown>, aliases: string[]): string {
  const wanted = aliases.map(normKey)
  for (const [key, value] of Object.entries(obj)) {
    if (!wanted.includes(normKey(key))) continue
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return ''
}

function pickArray(obj: Record<string, unknown>, aliases: string[]): unknown[] {
  const wanted = aliases.map(normKey)
  for (const [key, value] of Object.entries(obj)) {
    if (wanted.includes(normKey(key)) && Array.isArray(value)) return value
  }
  return []
}

function extractJsonDocuments(text: string): unknown[] {
  const docs: unknown[] = []
  const source = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try {
    docs.push(JSON.parse(source))
    return docs
  } catch {
    // scan for each top-level { ... }
  }

  let i = 0
  while (i < source.length) {
    const start = source.indexOf('{', i)
    if (start < 0) break
    let depth = 0
    let inString = false
    let escape = false
    let closed = false
    for (let j = start; j < source.length; j += 1) {
      const ch = source[j]
      if (inString) {
        if (escape) escape = false
        else if (ch === '\\') escape = true
        else if (ch === '"') inString = false
        continue
      }
      if (ch === '"') inString = true
      else if (ch === '{') depth += 1
      else if (ch === '}') {
        depth -= 1
        if (depth === 0) {
          const slice = source.slice(start, j + 1)
          try {
            docs.push(JSON.parse(slice))
          } catch {
            // skip broken object
          }
          i = j + 1
          closed = true
          break
        }
      }
    }
    if (!closed) break
  }
  return docs
}

function recoverMatchesFromText(text: string): OpportunityMatchItem[] {
  const chunks = text.split('{').slice(1)
  const found: OpportunityMatchItem[] = []
  for (const chunk of chunks) {
    const company = /"company"\s*:\s*"([^"]+)"/i.exec(chunk)?.[1]?.trim() ?? ''
    const role = /"role"\s*:\s*"([^"]+)"/i.exec(chunk)?.[1]?.trim() ?? ''
    const applyUrl = httpUrl(/"applyUrl"\s*:\s*"([^"]+)"/i.exec(chunk)?.[1] ?? '')
    if (!company || !role || !isOfficialApplyUrl(applyUrl)) continue
    const location = /"location"\s*:\s*"([^"]+)"/i.exec(chunk)?.[1]?.trim() ?? ''
    const why = /"why"\s*:\s*"([^"]+)"/i.exec(chunk)?.[1]?.trim() ?? ''
    const typeMatch = /"type"\s*:\s*"([^"]+)"/i.exec(chunk)?.[1]?.trim()
    const website = /"website"\s*:\s*"([^"]+)"/i.exec(chunk)?.[1]?.trim() ?? ''
    const domain = domainForCompany(company, website, applyUrl)
    found.push({
      type: typeMatch || 'Internship',
      name: `${role} · ${company}`,
      company,
      role,
      location,
      why,
      apply: applyUrl,
      applyUrl,
      logoUrl: logoUrlForDomain(domain),
    })
  }
  return found
}

function uniqueByCompany(matches: OpportunityMatchItem[]): OpportunityMatchItem[] {
  const seen = new Set<string>()
  const out: OpportunityMatchItem[] = []
  for (const item of matches) {
    const key = item.company.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function httpUrl(value: string): string {
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(trimmed)) return `https://${trimmed}`
  return ''
}

function extractDomain(urlOrHost: string): string {
  const raw = urlOrHost.trim()
  if (!raw) return ''
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`)
    return url.hostname.replace(/^www\./i, '')
  } catch {
    return ''
  }
}

const AGGREGATOR_HOSTS = [
  'unstop.com',
  'dare2compete.com',
  'internshala.com',
  'letsintern.com',
  'naukri.com',
  'indeed.com',
  'indeed.co.in',
  'linkedin.com',
  'glassdoor.com',
  'glassdoor.co.in',
  'wellfound.com',
  'angel.co',
  'shine.com',
  'foundit.in',
  'timesjobs.com',
  'monsterindia.com',
  'monster.com',
  'cutshort.io',
  'instahyre.com',
  'hirist.tech',
  'hirist.com',
  'iimjobs.com',
  'twenty19.com',
  'simplyhired.com',
  'ziprecruiter.com',
  'joinhandshake.com',
  'wayup.com',
  'apna.co',
  'freshersworld.com',
  'youth4work.com',
  'geeksforgeeks.org',
  'hackerearth.com',
  'devfolio.co',
]

function isAggregatorHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, '')
  return AGGREGATOR_HOSTS.some((listed) => h === listed || h.endsWith(`.${listed}`))
}

function isOfficialApplyUrl(url: string): boolean {
  const href = httpUrl(url)
  if (!href) return false
  const host = extractDomain(href)
  if (!host || isAggregatorHost(host)) return false
  if (/google\.[a-z.]+$/i.test(host) && /\/search/i.test(href)) return false
  return true
}

const COMPANY_DOMAINS: Record<string, string> = {
  google: 'google.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.in',
  flipkart: 'flipkart.com',
  swiggy: 'swiggy.com',
  zomato: 'zomato.com',
  paytm: 'paytm.com',
  phonepe: 'phonepe.com',
  razorpay: 'razorpay.com',
  cred: 'cred.club',
  zerodha: 'zerodha.com',
  infosys: 'infosys.com',
  tcs: 'tcs.com',
  wipro: 'wipro.com',
  accenture: 'accenture.com',
  adobe: 'adobe.com',
  salesforce: 'salesforce.com',
  atlassian: 'atlassian.com',
  uber: 'uber.com',
  ola: 'olacabs.com',
  nvidia: 'nvidia.com',
  intel: 'intel.com',
  ibm: 'ibm.com',
  deloitte: 'deloitte.com',
  'goldman sachs': 'goldmansachs.com',
  jpmorgan: 'jpmorgan.com',
  'morgan stanley': 'morganstanley.com',
  zoho: 'zoho.com',
  freshworks: 'freshworks.com',
  postman: 'postman.com',
  meesho: 'meesho.com',
  nykaa: 'nykaa.com',
  myntra: 'myntra.com',
  byjus: 'byjus.com',
  unacademy: 'unacademy.com',
  physicswallah: 'pw.live',
  'larsen toubro': 'larsentoubro.com',
  'l&t': 'larsentoubro.com',
  reliance: 'ril.com',
  jio: 'jio.com',
  airtel: 'airtel.in',
  tesla: 'tesla.com',
  meta: 'meta.com',
  facebook: 'meta.com',
  netflix: 'netflix.com',
  apple: 'apple.com',
  samsung: 'samsung.com',
  oracle: 'oracle.com',
  sap: 'sap.com',
  capgemini: 'capgemini.com',
  cognizant: 'cognizant.com',
  hcl: 'hcltech.com',
  'hcltech': 'hcltech.com',
  'tata steel': 'tatasteel.com',
  mahindra: 'mahindra.com',
  honda: 'honda.com',
  hyundai: 'hyundai.com',
}

function domainForCompany(company: string, website: string, applyUrl: string): string {
  const fromSite = extractDomain(website)
  if (fromSite && !isAggregatorHost(fromSite)) {
    return fromSite
  }
  const key = company.toLowerCase().replace(/[^a-z0-9&]+/g, ' ').trim()
  if (COMPANY_DOMAINS[key]) return COMPANY_DOMAINS[key]
  const firstTwo = key.split(' ').slice(0, 2).join(' ')
  if (COMPANY_DOMAINS[firstTwo]) return COMPANY_DOMAINS[firstTwo]
  const first = key.split(' ')[0] ?? ''
  if (COMPANY_DOMAINS[first]) return COMPANY_DOMAINS[first]
  if (fromSite) return fromSite
  return extractDomain(applyUrl)
}

function firstLongString(obj: Record<string, unknown>, skip: string[]): string {
  const skipSet = new Set(skip.map(normKey))
  for (const [key, value] of Object.entries(obj)) {
    if (skipSet.has(normKey(key))) continue
    if (typeof value === 'string' && value.trim().length > 2) return value.trim()
  }
  return ''
}

function logoUrlForDomain(domain: string): string {
  if (!domain) return ''
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
}

function normalizeMatchItem(item: unknown): OpportunityMatchItem | null {
  if (typeof item === 'string') return null
  const obj = asRecord(item)
  if (!obj) return null
  const type = pickString(obj, ['type', 'category', 'kind']) || 'Opportunity'
  const company = pickString(obj, ['company', 'companyname', 'employer', 'organization', 'org'])
  const role =
    pickString(obj, ['role', 'position', 'title', 'job', 'vacancy', 'opening', 'name', 'program', 'opportunity']) ||
    firstLongString(obj, ['type', 'category', 'kind', 'why', 'reason', 'apply', 'link', 'url', 'location'])
  if (!company && !role) return null
  const applyRaw = pickString(obj, [
    'applyurl',
    'applylink',
    'url',
    'link',
    'apply',
    'howtoapply',
    'applicationurl',
    'careersurl',
  ])
  const applyUrl = httpUrl(applyRaw)
  if (!company || !isOfficialApplyUrl(applyUrl)) return null
  const website = pickString(obj, ['website', 'domain', 'companywebsite', 'site'])
  const domain = domainForCompany(company, website, applyUrl)
  const displayName = `${role || 'Open role'} · ${company}`
  return {
    type,
    name: displayName,
    company,
    role: role || displayName,
    location: pickString(obj, ['location', 'city', 'place', 'where']),
    why: pickString(obj, ['why', 'reason', 'fit', 'whyitfits', 'description', 'details']),
    apply: applyUrl,
    applyUrl,
    logoUrl: logoUrlForDomain(domain),
  }
}

export async function generateGeminiText(
  apiKey: string,
  prompt: string,
  systemInstruction: string,
  options?: GeminiGenerateOptions,
): Promise<string> {
  return generateGeminiParts(apiKey, [{ text: prompt }], systemInstruction, options)
}

export async function generateGeminiParts(
  apiKey: string,
  parts: GeminiPart[],
  systemInstruction: string,
  options?: GeminiGenerateOptions,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

  async function request(searchTool: Record<string, unknown> | null) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: options?.temperature ?? 0.6,
          maxOutputTokens: options?.maxOutputTokens ?? 2048,
          ...(options?.json && !searchTool ? { responseMimeType: 'application/json' } : {}),
        },
        ...(searchTool ? { tools: [searchTool] } : {}),
      }),
    })
  }

  let res = await request(options?.search ? { google_search: {} } : null)
  if (!res.ok && options?.search) {
    res = await request({ googleSearch: {} })
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    error?: { message?: string }
  }

  if (!res.ok) {
    throw new Error(data.error?.message ?? `Gemini API error (${res.status})`)
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
  if (!text) {
    throw new Error('AI returned an empty response. Try again.')
  }

  return text
}

function collectMatchesFromUnknown(value: unknown, depth = 0): OpportunityMatchItem[] {
  if (depth > 6 || value == null) return []
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectMatchesFromUnknown(item, depth + 1))
  }
  const obj = asRecord(value)
  if (!obj) return []
  const self = normalizeMatchItem(obj)
  const nested = Object.values(obj).flatMap((child) => collectMatchesFromUnknown(child, depth + 1))
  return self ? [self, ...nested] : nested
}

function pickSnapshot(value: unknown, depth = 0): string {
  if (depth > 5 || value == null) return ''
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickSnapshot(item, depth + 1)
      if (found) return found
    }
    return ''
  }
  const obj = asRecord(value)
  if (!obj) return ''
  const direct = pickString(obj, ['snapshot', 'profilesnapshot', 'summary'])
  if (direct) return direct
  for (const child of Object.values(obj)) {
    const found = pickSnapshot(child, depth + 1)
    if (found) return found
  }
  return ''
}

export function parseOpportunityMatchPayload(text: string): OpportunityMatchPayload {
  const trimmed = text.trim()
  const docs = extractJsonDocuments(trimmed)
  const fromDocs = docs.flatMap((doc) => collectMatchesFromUnknown(doc))
  const fromText = recoverMatchesFromText(trimmed)
  const matches = uniqueByCompany([...fromDocs, ...fromText]).slice(0, 8)
  const snapshot = docs.map((doc) => pickSnapshot(doc)).find(Boolean) ?? ''
  const next = docs.flatMap((doc) => {
    const obj = asRecord(doc)
    if (!obj) return []
    return pickArray(obj, ['next', 'nextsteps', 'plan', 'actions']).map((item) =>
      typeof item === 'string' ? item.trim() : '',
    )
  }).filter(Boolean).slice(0, 3)

  if (matches.length > 0) {
    return { snapshot, matches, next }
  }

  return {
    snapshot,
    matches: [],
    next,
  }
}

export function parseVoiceProfilePayload(text: string): VoiceProfilePayload {
  const parsed = parseGeminiJson<Partial<VoiceProfilePayload>>(text)
  return {
    stream: String(parsed.stream ?? '').trim(),
    year: String(parsed.year ?? '').trim(),
    skills: String(parsed.skills ?? '').trim(),
    goals: String(parsed.goals ?? '').trim(),
  }
}

export const RESUME_REVIEW_SYSTEM = `You are PRIZMA's student career coach for India. Review resumes for students and early-career candidates.
Respond in clear markdown with these sections:
## Overall score (out of 10)
## Key gaps
## Section improvements (Education, Projects, Skills, Experience)
## ATS & formatting tips
## Top 3 actions this week
Be specific, honest, and encouraging. Use bullet points. Keep under 500 words.`

export const OPPORTUNITY_MATCH_SYSTEM = `You are PRIZMA's opportunity advisor for Indian students.
Use Google Search to find REAL, currently open internships or jobs on the company's OWN careers page.
Return ONLY JSON:
{
  "snapshot": "one short sentence about the student",
  "matches": [
    {
      "type": "Internship",
      "company": "real company name",
      "role": "exact vacancy / role title from the posting",
      "location": "city or Remote / India",
      "why": "why this student fits, max 14 words",
      "applyUrl": "https://company-careers-page-or-official-ats-job-url",
      "website": "company.com"
    }
  ],
  "next": ["action 1", "action 2", "action 3"]
}
Hard rules:
- Return ONE json object only. Do not print extra objects. Do not nest snapshot inside type.
- matches must be an array of 8 items. Each item is a DIFFERENT company — never repeat Google or any other name.
- Mix Indian and global employers that fit the student, for example: Microsoft, Amazon, Adobe, Zoho, Freshworks, Flipkart, Swiggy, Razorpay, PhonePe, Uber, Atlassian, Salesforce.
- Search queries like: "[company] careers internship India 2026", "site:careers.microsoft.com intern", "site:amazon.jobs intern India".
- applyUrl MUST be that company's official posting: company.com/careers, careers.company.com, amazon.jobs, boards.greenhouse.io/company, company.lever.co, myworkdayjobs.com.
- NEVER use Unstop, Internshala, LinkedIn, Naukri, Indeed, Glassdoor, Wellfound, Shine, Cutshort, Instahyre, or any job aggregator.
- Do not invent vacancies or fake URLs. If you cannot find the official company link, skip that company.
- Prefer India-eligible roles. No markdown, no code fences.`

export const VOICE_PROFILE_SYSTEM = `You extract a student profile from Hindi, English, or Hinglish speech or notes.
Return ONLY JSON: {"stream":"","year":"","skills":"","goals":""}
- stream: degree or stream, e.g. B.Tech CSE, B.Com, Class 12 PCB
- year: e.g. 2nd year, final year, 2026 passout
- skills: comma-separated skills and interests
- goals: what they want, e.g. summer internship, scholarship
If a field is unknown, use an empty string. Do not invent companies, scores, or extra facts.`

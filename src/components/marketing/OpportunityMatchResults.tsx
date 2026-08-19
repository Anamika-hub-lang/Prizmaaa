import { useState } from 'react'
import { ExternalLink, MapPin, Sparkles } from 'lucide-react'
import type { OpportunityMatchItem, OpportunityMatchResult } from '../../lib/aiToolsApi'

type Props = {
  result: OpportunityMatchResult
}

const typeStyles: Record<string, string> = {
  Internship: 'bg-sky-100 text-sky-800',
  Job: 'bg-indigo-100 text-indigo-800',
  Scholarship: 'bg-amber-100 text-amber-800',
  Course: 'bg-violet-100 text-violet-800',
  Competition: 'bg-rose-100 text-rose-800',
  Hackathon: 'bg-emerald-100 text-emerald-800',
}

function typeClass(type: string): string {
  return typeStyles[type] ?? 'bg-indigo-100 text-indigo-800'
}

function applyHref(item: OpportunityMatchItem): string | null {
  const candidate = item.applyUrl || item.apply
  if (/^https?:\/\//i.test(candidate.trim())) return candidate.trim()
  return null
}

function CompanyLogo({ company, logoUrl }: { company: string; logoUrl: string }) {
  const [failed, setFailed] = useState(false)
  const initial = (company || '?').trim().charAt(0).toUpperCase() || '?'

  if (!logoUrl || failed) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
        {initial}
      </span>
    )
  }

  return (
    <img
      src={logoUrl}
      alt=""
      width={44}
      height={44}
      className="h-11 w-11 shrink-0 rounded-xl border border-indigo-100 bg-white object-contain p-1"
      onError={() => setFailed(true)}
    />
  )
}

export function OpportunityMatchResults({ result }: Props) {
  const hasCards = result.matches.length > 0

  return (
    <div className="rounded-3xl border-2 border-indigo-100 bg-white shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-indigo-50">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Open roles for you
        </p>
        {result.snapshot && (
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">{result.snapshot}</p>
        )}
        <p className="mt-1.5 text-[11px] text-gray-400">
          Official company career pages only — not Unstop, Internshala, or other boards.
        </p>
      </div>

      <div
        className="max-h-[70vh] overflow-y-auto px-5 sm:px-6 py-4 space-y-3"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {hasCards ? (
          result.matches.map((item, index) => {
            const href = applyHref(item)
            const company = item.company || 'Company'
            const role = item.role || item.name
            return (
              <article
                key={`${company}-${role}-${index}`}
                className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <CompanyLogo company={company} logoUrl={item.logoUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typeClass(item.type)}`}>
                        {item.type}
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-display text-[15px] text-[#1a1a1a] leading-snug">{role}</h3>
                    <p className="text-sm font-semibold text-indigo-800">{company}</p>
                    {item.why && <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.why}</p>}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Apply at {company}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : item.apply ? (
                      <p className="mt-2 text-xs text-indigo-800/80 leading-snug">{item.apply}</p>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <p className="text-sm text-gray-500 py-6 text-center">No open roles found. Try again with more detail.</p>
        )}

        {result.next.length > 0 && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">Next 3 moves</p>
            <ol className="mt-2 space-y-2">
              {result.next.map((step, index) => (
                <li key={step} className="flex gap-2 text-sm text-gray-700 leading-snug">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

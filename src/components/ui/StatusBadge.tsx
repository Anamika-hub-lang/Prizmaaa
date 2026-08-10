import type { ReactNode } from 'react'

type StatusTone = 'pending' | 'approved' | 'rejected' | 'upcoming' | 'completed' | 'assigned' | 'unassigned' | 'neutral'

const toneClass: Record<StatusTone, string> = {
  pending: 'bg-amber-100 border-amber-200 text-amber-900',
  approved: 'bg-emerald-100 border-emerald-200 text-emerald-800',
  rejected: 'bg-rose-100 border-rose-200 text-rose-800',
  upcoming: 'bg-sky-100 border-sky-200 text-sky-800',
  completed: 'bg-gray-100 border-gray-200 text-gray-700',
  assigned: 'bg-emerald-100 border-emerald-200 text-emerald-800',
  unassigned: 'bg-orange-100 border-orange-200 text-orange-900',
  neutral: 'bg-orange-50 border-orange-100 text-gray-700',
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: StatusTone
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${toneClass[tone]}`}
    >
      {label}
    </span>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-10 text-center">
      <p className="font-semibold text-[#1d1d1d]">{title}</p>
      {description ? <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center text-sm text-gray-500">
      {label}
    </div>
  )
}

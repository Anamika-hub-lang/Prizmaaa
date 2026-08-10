import type { ProfileCompletionItem } from '../../lib/profileCompletion'

export function ProfileCompletionCard({
  percent,
  items,
}: {
  percent: number
  items: ProfileCompletionItem[]
}) {
  const pending = items.filter((i) => !i.done)
  const complete = items.length - pending.length

  return (
    <div className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 shadow-sm text-left">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Profile completion</p>
          <p className="text-3xl font-bold text-[#1d1d1d] mt-1">{percent}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {complete} of {items.length} fields done
            {pending.length > 0 ? ` · ${pending.length} pending` : ' · All complete'}
          </p>
        </div>
        <span
          className={`text-sm font-bold px-4 py-2 rounded-full ${
            percent === 100
              ? 'bg-emerald-100 text-emerald-800'
              : percent >= 60
                ? 'bg-amber-100 text-amber-900'
                : 'bg-orange-100 text-educture-orange'
          }`}
        >
          {percent === 100 ? 'Complete' : `${100 - percent}% to go`}
        </span>
      </div>

      <div className="h-3 rounded-full bg-orange-50 overflow-hidden border border-orange-100">
        <div
          className="h-full bg-educture-orange transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>

      {pending.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Still needed</p>
          <ul className="space-y-1.5">
            {pending.map((p) => (
              <li key={p.id} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-educture-orange shrink-0" />
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

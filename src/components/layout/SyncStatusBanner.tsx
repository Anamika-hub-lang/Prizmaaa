import { useMentorContent } from '../../context/MentorContentContext'

export function SyncStatusBanner() {
  const { loading, syncError, isRealtime, usingLocalData } = useMentorContent()

  if (syncError) {
    return (
      <div className="bg-red-50 border-b border-red-100 text-red-700 text-xs sm:text-sm text-center px-4 py-2">
        Sync error: {syncError}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-sky-50 border-b border-sky-100 text-sky-700 text-xs sm:text-sm text-center px-4 py-2">
        Loading live data…
      </div>
    )
  }

  if (usingLocalData) {
    return (
      <div className="bg-amber-50 border-b border-amber-100 text-amber-900 text-xs sm:text-sm text-center px-4 py-2">
        Using demo course data — check{' '}
        <code className="font-mono text-[11px]">VITE_SUPABASE_URL</code> in{' '}
        <code className="font-mono text-[11px]">.env</code> (Supabase → Settings → API → Project URL).
        Run <code className="font-mono text-[11px]">supabase/schema.sql</code> in your project.
      </div>
    )
  }

  if (isRealtime) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-xs sm:text-sm text-center px-4 py-2">
        Live sync on — mentor changes appear here in real time
      </div>
    )
  }

  return (
    <div className="bg-amber-50 border-b border-amber-100 text-amber-900 text-xs sm:text-sm text-center px-4 py-2">
      Demo mode (local only). Add Supabase keys in `.env` for real-time sync — see `supabase/README.md`
    </div>
  )
}

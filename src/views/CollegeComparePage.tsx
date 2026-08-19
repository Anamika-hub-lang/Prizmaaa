import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, GitCompare, X } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { useColleges } from '../hooks/useColleges'
import { formatFees, formatPackage } from '../lib/colleges/repository'

const MAX_COMPARE = 4

export function CollegeComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { colleges, loading } = useColleges()

  const selectedSlugs = useMemo(() => {
    const fromList = searchParams.get('slugs')?.split(',').filter(Boolean) ?? []
    const fromAdds = searchParams.getAll('add').filter(Boolean)
    return [...new Set([...fromList, ...fromAdds])].slice(0, MAX_COMPARE)
  }, [searchParams])

  const selected = useMemo(
    () => selectedSlugs.map((slug) => colleges.find((c) => c.slug === slug)).filter(Boolean),
    [colleges, selectedSlugs],
  )

  const available = useMemo(
    () => colleges.filter((c) => !selectedSlugs.includes(c.slug)),
    [colleges, selectedSlugs],
  )

  function addSlug(slug: string) {
    if (selectedSlugs.includes(slug) || selectedSlugs.length >= MAX_COMPARE) return
    const next = [...selectedSlugs, slug]
    setSearchParams({ slugs: next.join(',') })
  }

  function removeSlug(slug: string) {
    const next = selectedSlugs.filter((s) => s !== slug)
    if (next.length === 0) {
      setSearchParams({})
    } else {
      setSearchParams({ slugs: next.join(',') })
    }
  }

  const rows: Array<{ label: string; render: (c: (typeof selected)[0]) => string }> = [
    { label: 'Type', render: (c) => c!.type },
    { label: 'Location', render: (c) => `${c!.city}, ${c!.state}` },
    { label: 'Fees / year', render: (c) => formatFees(c!.fees) },
    { label: 'Avg package', render: (c) => formatPackage(c!.averagePackage) },
    { label: 'Highest package', render: (c) => formatPackage(c!.highestPackage) },
    { label: 'Placement rate', render: (c) => (c!.placementRate != null ? `${c!.placementRate}%` : 'N/A') },
    { label: 'NIRF rank', render: (c) => (c!.ranking != null ? `#${c!.ranking}` : 'N/A') },
    { label: 'Hostel', render: (c) => (c!.hostel ? 'Yes' : 'No') },
    { label: 'Entrance', render: (c) => c!.entrance.join(', ') },
    { label: 'Companies', render: (c) => c!.companies.join(', ') },
    { label: 'Courses', render: (c) => c!.courses.join(', ') },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
      <MainNavbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <Link to="/colleges" className="text-sm text-gray-500 hover:text-educture-orange inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          All colleges
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <GitCompare className="w-6 h-6 text-educture-orange" />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#1a1a1a]">Compare colleges</h1>
            <p className="text-sm text-gray-500">Add up to {MAX_COMPARE} colleges side by side.</p>
          </div>
        </div>

        {selectedSlugs.length < MAX_COMPARE && (
          <div className="mt-6 rounded-2xl border-[3px] border-orange-100 bg-white p-4">
            <label className="text-sm font-semibold text-gray-700">Add college</label>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) addSlug(e.target.value)
                e.target.value = ''
              }}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm"
              disabled={loading}
            >
              <option value="">Select a college…</option>
              {available.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selected.length === 0 ? (
          <div className="mt-10 text-center py-16 rounded-2xl border-[3px] border-dashed border-orange-200">
            <p className="text-gray-600">No colleges selected yet.</p>
            <Link to="/colleges" className="text-educture-orange font-semibold text-sm mt-2 inline-block">
              Browse colleges to compare
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border-[3px] border-orange-100 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-orange-100">
                  <th className="text-left p-4 font-semibold text-gray-400 w-36"> </th>
                  {selected.map((c) => (
                    <th key={c!.slug} className="text-left p-4 align-top min-w-[180px]">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/colleges/${c!.slug}`}
                          className="font-display text-base text-[#1a1a1a] hover:text-educture-orange leading-snug"
                        >
                          {c!.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeSlug(c!.slug)}
                          className="text-gray-300 hover:text-red-500 shrink-0"
                          aria-label="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-orange-50 last:border-0">
                    <td className="p-4 font-semibold text-gray-500 bg-orange-50/50">{row.label}</td>
                    {selected.map((c) => (
                      <td key={c!.slug} className="p-4 text-gray-800 align-top">
                        {row.render(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <MarketingFooter />
    </div>
  )
}

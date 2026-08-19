import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Search, Sparkles } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { CollegeCard, CollegesEmptyState } from '../components/colleges/CollegeCard'
import { CollegeGuidanceFlow } from '../components/colleges/CollegeGuidanceFlow'
import { useColleges } from '../hooks/useColleges'
import {
  filterColleges,
  uniqueCourses,
  uniqueEntrances,
  uniqueStates,
} from '../lib/colleges/repository'
import type { CollegeFilters, OwnershipPreference } from '../lib/colleges/types'

const defaultFilters: CollegeFilters = {
  course: '',
  budget: null,
  state: 'all',
  city: '',
  ownership: 'any',
  company: '',
  entrance: '',
  hostel: null,
  minPlacementRate: null,
}

export function CollegesPage() {
  const { colleges, loading } = useColleges()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<CollegeFilters>(defaultFilters)

  const courseOptions = useMemo(() => uniqueCourses(colleges), [colleges])
  const stateOptions = useMemo(() => uniqueStates(colleges), [colleges])
  const entranceOptions = useMemo(() => uniqueEntrances(colleges), [colleges])

  const filtered = useMemo(() => {
    let list = filterColleges(colleges, filters)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.courses.some((course) => course.toLowerCase().includes(q)),
      )
    }
    return list
  }, [colleges, filters, search])

  function setFilter<K extends keyof CollegeFilters>(key: K, value: CollegeFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
      <MainNavbar />

      <main className="flex-1">
        <section className="bg-[#0f0f12] text-white border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
            <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              College Finder
            </p>
            <h1 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">
              Find your{' '}
              <span className="font-script text-educture-orange text-4xl sm:text-5xl">college</span>
            </h1>
            <p className="text-sm text-gray-400 mt-3 max-w-xl">
              You choose the college — PRIZMA guides what comes next: path in, seniors, guidance calls,
              classes & opportunities.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/colleges/find"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-educture-orange text-white text-sm font-semibold hover:opacity-90"
              >
                <Sparkles className="w-4 h-4" />
                Find my match
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <aside className="space-y-4">
              <div className="rounded-2xl border-[3px] border-orange-100 bg-white p-4 space-y-4 sticky top-24">
                <h2 className="font-semibold text-sm text-gray-800">Filters</h2>

                <label className="block text-xs text-gray-500">
                  Course
                  <select
                    value={filters.course}
                    onChange={(e) => setFilter('course', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="">All courses</option>
                    {courseOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs text-gray-500">
                  Max budget / year (₹)
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="e.g. 300000"
                    value={filters.budget ?? ''}
                    onChange={(e) =>
                      setFilter('budget', e.target.value ? Number(e.target.value) : null)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-xs text-gray-500">
                  State
                  <select
                    value={filters.state}
                    onChange={(e) => setFilter('state', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="all">All states</option>
                    {stateOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs text-gray-500">
                  City
                  <input
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={filters.city}
                    onChange={(e) => setFilter('city', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-xs text-gray-500">
                  Government / Private
                  <select
                    value={filters.ownership}
                    onChange={(e) => setFilter('ownership', e.target.value as OwnershipPreference)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="any">Any</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                  </select>
                </label>

                <label className="block text-xs text-gray-500">
                  Company recruiter
                  <input
                    type="text"
                    placeholder="Type company name…"
                    value={filters.company}
                    onChange={(e) => setFilter('company', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-xs text-gray-500">
                  Entrance exam
                  <select
                    value={filters.entrance}
                    onChange={(e) => setFilter('entrance', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="">Any</option>
                    {entranceOptions.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs text-gray-500">
                  Hostel
                  <select
                    value={filters.hostel === null ? '' : filters.hostel ? 'yes' : 'no'}
                    onChange={(e) => {
                      const v = e.target.value
                      setFilter('hostel', v === '' ? null : v === 'yes')
                    }}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="">Any</option>
                    <option value="yes">Required</option>
                    <option value="no">Not required</option>
                  </select>
                </label>

                <label className="block text-xs text-gray-500">
                  Min placement rate (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 70"
                    value={filters.minPlacementRate ?? ''}
                    onChange={(e) =>
                      setFilter('minPlacementRate', e.target.value ? Number(e.target.value) : null)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setFilters(defaultFilters)}
                  className="w-full text-sm text-gray-500 hover:text-educture-orange"
                >
                  Clear filters
                </button>
              </div>
            </aside>

            <div>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search by name, city, or course…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-[3px] border-orange-100 bg-white text-sm"
                />
              </div>

              <p className="text-sm text-gray-500 mb-4">
                {loading ? 'Loading…' : `${filtered.length} college${filtered.length === 1 ? '' : 's'}`}
              </p>

              {loading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-orange-50 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <CollegesEmptyState />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filtered.map((college) => (
                    <CollegeCard key={college.slug} college={college} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <CollegeGuidanceFlow variant="compact" />
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

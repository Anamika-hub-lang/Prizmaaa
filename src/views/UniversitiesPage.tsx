'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, Search } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { UniversityCard } from '../components/universities/UniversityCard'
import {
  universities,
  universityTypeLabels,
  type UniversityType,
} from '../data/universities'
import { averageRating } from '../lib/universityReviews'
import { useUniversityReviews } from '../hooks/useUniversityReviews'

const typeFilters: Array<UniversityType | 'all'> = [
  'all',
  'iit',
  'nit',
  'iim',
  'deemed',
  'central',
  'state',
  'private',
]

const stateFilters = ['all', 'Delhi', 'Haryana'] as const

export function UniversitiesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<UniversityType | 'all'>('all')
  const [stateFilter, setStateFilter] = useState<(typeof stateFilters)[number]>('all')
  const [searchParams] = useSearchParams()
  const highlightWrite = searchParams.get('write') === '1'
  const { reviews } = useUniversityReviews()

  const reviewsByUniversity = useMemo(() => {
    const map = new Map<string, typeof reviews>()
    for (const r of reviews) {
      const list = map.get(r.universityId) ?? []
      list.push(r)
      map.set(r.universityId, list)
    }
    return map
  }, [reviews])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return universities.filter((u) => {
      const matchesType = typeFilter === 'all' || u.type === typeFilter
      const matchesState = stateFilter === 'all' || u.state === stateFilter
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q)
      return matchesType && matchesState && matchesSearch
    })
  }, [search, typeFilter, stateFilter])

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
      <MainNavbar />

      <main className="flex-1">
        <section className="bg-[#0f0f12] text-white border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-left">
            <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Campus stories
            </p>
            <h1 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">
              Discover{' '}
              <span className="font-script text-educture-orange text-4xl sm:text-5xl">campuses</span>
            </h1>
            <p className="text-sm text-gray-400 mt-3 max-w-xl leading-relaxed">
              Real student experiences on academics, campus life, and placements — honest takes from
              peers across India.
            </p>
            {highlightWrite && (
              <p className="mt-4 text-sm text-orange-200 bg-educture-orange/15 border border-educture-orange/30 rounded-xl px-4 py-3 max-w-lg">
                Pick a campus below to read stories and share your experience.
              </p>
            )}
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search campus, city, state…"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-orange-100 bg-white text-sm outline-none focus:border-educture-orange"
                />
              </div>
              <p className="text-sm text-gray-500 shrink-0">
                {filtered.length} of {universities.length} universities
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              {stateFilters.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setStateFilter(state)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border-2 transition-colors ${
                    stateFilter === state
                      ? 'border-educture-orange bg-educture-orange text-white'
                      : 'border-orange-100 bg-white text-gray-600 hover:border-educture-orange/40'
                  }`}
                >
                  {state === 'all' ? 'All states' : state}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {typeFilters.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border-2 transition-colors ${
                    typeFilter === type
                      ? 'border-educture-orange bg-educture-orange text-white'
                      : 'border-orange-100 bg-white text-gray-600 hover:border-educture-orange/40'
                  }`}
                >
                  {type === 'all' ? 'All types' : universityTypeLabels[type]}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {filtered.map((uni) => {
                const uniReviews = reviewsByUniversity.get(uni.id) ?? []
                return (
                  <UniversityCard
                    key={uni.id}
                    university={uni}
                    avgRating={averageRating(uniReviews)}
                    reviewCount={uniReviews.length}
                  />
                )
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-12">
                No universities match your search.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setTypeFilter('all')
                    setStateFilter('all')
                  }}
                  className="text-educture-orange font-semibold hover:underline"
                >
                  Clear filters
                </button>
              </p>
            )}

            <p className="text-center mt-10 text-sm text-gray-500">
              Know a campus we missed? Share your experience after searching — more campuses are added regularly.
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

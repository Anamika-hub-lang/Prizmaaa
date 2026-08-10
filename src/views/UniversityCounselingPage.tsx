import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, GraduationCap, Search } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { CounselingUniversityCard } from '../components/marketing/CounselingUniversityCard'
import { featuredUniversities } from '../components/marketing/university-counseling/data'

export function UniversityCounselingPage() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return featuredUniversities
    return featuredUniversities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q),
    )
  }, [search])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fffbf7] to-white">
      <MainNavbar />

      <main className="flex-1">
        <section className="bg-[#0f0f12] text-white border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <p className="text-violet-300 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 mt-6">
              <GraduationCap className="w-4 h-4" />
              University counseling
            </p>
            <h1 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">
              Pick your{' '}
              <span className="font-script text-educture-orange text-4xl sm:text-5xl">university</span>
            </h1>
            <p className="text-sm text-gray-400 mt-3 max-w-xl leading-relaxed">
              1:1 guidance from counselors who know SGT, GD Goenka, K.R. Mangalam, Amity & more —
              launching soon on PRIZMA.
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search university name…"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-violet-100 bg-white text-sm outline-none focus:border-violet-400 shadow-sm"
              />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-3">
              {filtered.length} universities
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((uni) => (
                <CounselingUniversityCard key={uni.id} university={uni} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-12">
                No university found. Try another name.
              </p>
            )}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

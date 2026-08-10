import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import { ArrowLeft, ArrowRight, Video } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { useMentorContent } from '../context/MentorContentContext'
import {
  classCategories,
  formatBrowsePricingSummary,
  type ClassCategoryId,
} from '../data/classCatalog'
import { tintedSurfaceKey } from '../components/ui/dashboardCardStyles'

const ALL: 'all' = 'all'
const AUTH_RETURN_KEY = 'educture_auth_return'

export function LiveClassesPage() {
  const navigate = useNavigate()
  const { publishedClasses } = useMentorContent()
  const { isSignedIn } = useAuth()
  const [filter, setFilter] = useState<ClassCategoryId | typeof ALL>(ALL)
  const pricingLine = formatBrowsePricingSummary()

  const classes = useMemo(() => {
    if (filter === ALL) return publishedClasses
    return publishedClasses.filter((c) => c.categoryId === filter)
  }, [publishedClasses, filter])

  function handleEnroll(classId: string) {
    const next = `/student/class/${classId}`
    if (isSignedIn) {
      navigate(next)
      return
    }
    try {
      sessionStorage.setItem(AUTH_RETURN_KEY, next)
    } catch {
      /* ignore */
    }
    navigate('/sign-up', { state: { from: next } })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
      <MainNavbar />

      <main className="flex-1">
        <section className="bg-[#0f0f12] text-white border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-5">
              <div>
                <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Live classes
                </p>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl mt-1 leading-tight">
                  Browse all{' '}
                  <span className="font-script text-educture-orange text-3xl sm:text-4xl">classes</span>
                </h1>
                <p className="text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
                  Explore every live class on PRIZMA. Sign up when you&apos;re ready to enroll —{' '}
                  {pricingLine}.
                </p>
              </div>
              {!isSignedIn && (
                <Link
                  to="/sign-up"
                  className="inline-flex items-center gap-2 shrink-0 px-5 py-2.5 rounded-full bg-educture-orange text-white text-sm font-semibold hover:bg-educture-orange-dark transition-colors"
                >
                  Sign up to enroll
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              <button
                type="button"
                onClick={() => setFilter(ALL)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border-2 transition-colors ${
                  filter === ALL
                    ? 'border-educture-orange bg-educture-orange text-white'
                    : 'border-orange-100 bg-white text-gray-600 hover:border-educture-orange/40'
                }`}
              >
                All ({publishedClasses.length})
              </button>
              {classCategories.map((cat) => {
                const count = publishedClasses.filter((c) => c.categoryId === cat.id).length
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilter(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border-2 transition-colors ${
                      filter === cat.id
                        ? 'border-educture-orange bg-educture-orange text-white'
                        : 'border-orange-100 bg-white text-gray-600 hover:border-educture-orange/40'
                    }`}
                  >
                    {cat.title.replace(' Classes', '')} ({count})
                  </button>
                )
              })}
            </div>

            {classes.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-16">
                No live classes published in this category yet. Check back soon.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {classes.map((item) => (
                  <article
                    key={item.id}
                    className={`overflow-hidden rounded-2xl text-left ${tintedSurfaceKey(item.id)}`}
                  >
                    <div className="relative border-b-2 border-white/70">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-40 sm:h-44 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 sm:p-5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-educture-orange">
                        {classCategories.find((c) => c.id === item.categoryId)?.title ?? item.categoryId}
                      </p>
                      <h2 className="font-bold text-[#1d1d1d] text-sm sm:text-base mt-1 leading-snug">
                        {item.title}
                      </h2>
                      <p className="text-xs text-gray-600 mt-1.5">
                        {item.duration} · {item.sessions}
                      </p>
                      <p className="text-xs text-educture-orange font-semibold mt-1 truncate">
                        {item.mentor}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleEnroll(item.id)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-educture-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-educture-orange-dark transition-colors"
                      >
                        {isSignedIn ? 'View & enroll' : 'Sign up to take this class'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <p className="text-center text-xs text-gray-500 mt-10 leading-relaxed">
              Browsing is free. You only need an account when you enroll in a live class.
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import { ArrowLeft, ArrowRight, Video } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { useMentorContent } from '../context/MentorContentContext'
import { useCategoryPricing } from '../context/CategoryPricingContext'
import {
  classCategories,
  formatBrowsePricingSummary,
  type ClassCategoryId,
} from '../data/classCatalog'
import { formatInr } from '../data/pricingPlans'
import { tintedSurfaceKey } from '../components/ui/dashboardCardStyles'
import { FaqSection } from '../components/seo/FaqSection'
import { SeoCoverImage } from '../components/seo/SeoCoverImage'
import { MentorAvatar } from '../components/ui/MentorAvatar'
import { classesFaqs } from '../data/seoFaqs'
import { COUNSELLING_PRICE_INR } from '../data/counsellingServices'
import { attachClassSlugs, classPublicPath } from '../lib/classSlug'

const ALL: 'all' = 'all'

type ListedClass = {
  id: string
  title: string
  slug?: string
  categoryId: ClassCategoryId
  image: string
  mentor: string
  mentorImage: string
  duration: string
  sessions: string
}

export function LiveClassesPage({ initialClasses = [] }: { initialClasses?: ListedClass[] }) {
  const { publishedClasses } = useMentorContent()
  const { pricing } = useCategoryPricing()
  const { isSignedIn } = useAuth()
  const [filter, setFilter] = useState<ClassCategoryId | typeof ALL>(ALL)
  const pricingLine = formatBrowsePricingSummary()
  const listingSource: ListedClass[] =
    publishedClasses.length > 0 ? publishedClasses : initialClasses
  const catalog = attachClassSlugs(listingSource)

  const classes = useMemo(() => {
    if (filter === ALL) return catalog
    return catalog.filter((c) => c.categoryId === filter)
  }, [catalog, filter])

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
                  Online learning platform
                </p>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl mt-1 leading-tight">
                  Online classes and live{' '}
                  <span className="font-script text-educture-orange text-3xl sm:text-4xl">courses</span>
                </h1>
                <p className="text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
                  Live online classes and online courses for students on Google Meet — skills, academics,
                  and professional tracks. Need help picking a course?{' '}
                  <Link to="/counselling" className="text-educture-orange font-semibold hover:underline">
                    Book career counselling
                  </Link>
                  . {pricingLine}.
                </p>
              </div>
              {!isSignedIn && (
                <Link
                  to="/sign-up"
                  className="inline-flex items-center gap-2 shrink-0 px-5 py-2.5 rounded-full bg-educture-orange text-white text-sm font-semibold hover:bg-educture-orange-dark transition-colors"
                >
                  Join to enroll
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
                All ({catalog.length})
              </button>
              {classCategories.map((cat) => {
                const count = catalog.filter((c) => c.categoryId === cat.id).length
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
                    {cat.title.replace(' Sessions', '').replace(' Classes', '')} ({count})
                  </button>
                )
              })}
            </div>

            {classes.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-16">
                No online classes published in this category yet. Check back soon.
              </p>
            ) : (
              <>
                <h2 className="font-display text-xl text-[#1a1a1a] mb-4">
                  {filter === ALL ? 'All live online classes' : 'Online classes in this track'}
                </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
                {classes.map((item) => {
                  const plans = pricing[item.categoryId]
                  const topic =
                    classCategories.find((c) => c.id === item.categoryId)?.title ?? item.categoryId
                  return (
                  <article
                    key={item.id}
                    className={`flex h-full flex-col overflow-hidden rounded-2xl text-left ${tintedSurfaceKey(item.id)}`}
                  >
                    <div className="relative h-40 sm:h-44 shrink-0 border-b-2 border-white/70">
                      <Link to={classPublicPath(item)} className="absolute inset-0">
                        <SeoCoverImage
                          src={item.image}
                          alt={`${item.title} online class`}
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 280px"
                          className="object-cover"
                        />
                      </Link>
                      <span className="absolute top-2 left-2 bg-educture-orange text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border-2 border-orange-200">
                        Paid
                      </span>
                    </div>
                    <div className="p-4 sm:p-5 flex flex-1 flex-col min-h-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-educture-orange">
                        {topic}
                      </p>
                      <h3 className="font-bold text-[#1d1d1d] text-sm sm:text-base mt-1 leading-snug line-clamp-2 min-h-[2.5rem]">
                        <Link to={classPublicPath(item)} className="hover:text-educture-orange">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-600 mt-1.5">
                        {item.duration} · {item.sessions}
                      </p>
                      {item.mentor ? (
                        <div className="flex items-center gap-2 mt-1.5 min-w-0">
                          <MentorAvatar src={item.mentorImage} name={item.mentor} size="sm" />
                          <p className="text-xs text-educture-orange font-semibold truncate">
                            {item.mentor}
                          </p>
                        </div>
                      ) : null}
                      <p className="text-[11px] text-gray-600 mt-2 leading-snug">
                        {formatInr(plans.monthlyInr)}/mo · {formatInr(plans.threeMonthInr)} / 3 mo ·{' '}
                        {formatInr(plans.sixMonthInr)} / 6 mo
                      </p>
                      <div className="mt-auto pt-4">
                        <Link
                          to={classPublicPath(item)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-educture-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-educture-orange-dark transition-colors"
                        >
                          Explore
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                  )
                })}
              </div>
              </>
            )}

            <p className="text-center text-xs text-gray-500 mt-10 leading-relaxed">
              Browsing online classes is free. You only need an account when you enrol.{' '}
              <Link to="/counselling" className="text-educture-orange font-semibold hover:underline">
                Career counselling
              </Link>{' '}
              is ₹{COUNSELLING_PRICE_INR} if you want help choosing a course.
            </p>
            <FaqSection heading="Online classes FAQs" items={classesFaqs} />
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

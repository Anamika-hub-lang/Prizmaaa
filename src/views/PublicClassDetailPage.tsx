'use client'

import { useAuth } from '@clerk/nextjs'
import { ArrowLeft, ArrowRight, Check, Video } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { MentorAvatar } from '../components/ui/MentorAvatar'
import { getCategoryById } from '../data/classCatalog'
import {
  coursePlanBlueprintOrder,
  coursePlanBlueprints,
} from '../data/coursePlanBlueprint'
import { formatInr, getPaymentAmount } from '../data/pricingPlans'
import { useCategoryPricing } from '../context/CategoryPricingContext'
import { SeoCoverImage } from '../components/seo/SeoCoverImage'
import { classPublicPath } from '../lib/classSlug'
import type { PublishedClass } from '../lib/publishedClasses'

const AUTH_RETURN_KEY = 'educture_auth_return'

const planCardClass: Record<(typeof coursePlanBlueprintOrder)[number], string> = {
  monthly: 'bg-sky-50/80 border-sky-100',
  'three-month': 'bg-[#fff9f3] border-orange-100',
  'six-month': 'bg-violet-50/70 border-violet-100',
}

export function PublicClassDetailPage({
  initialClass,
  relatedClasses = [],
}: {
  initialClass: PublishedClass
  relatedClasses?: PublishedClass[]
}) {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const { pricing } = useCategoryPricing()
  const category = getCategoryById(initialClass.categoryId)
  const description = initialClass.description.trim()
    || `${initialClass.title} is a live online class on PRIZMA.`

  function handleEnroll() {
    const next = `/student/class/${initialClass.id}`
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
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#fdf8f0]">
      <MainNavbar />

      <main className="flex-1 min-w-0">
        <section className="bg-[#0f0f12] text-white border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-left">
            <Link
              to="/classes"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              All online classes
            </Link>
            <p className="text-educture-orange font-bold text-[10px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] flex items-center gap-2 mt-4 sm:mt-5">
              <Video className="w-4 h-4 shrink-0" />
              <span className="min-w-0 break-words">{category?.title ?? 'Live peer session'}</span>
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl mt-2 leading-tight break-words">
              {initialClass.title}
            </h1>
            {initialClass.mentor ? (
              <p className="text-sm text-gray-400 mt-3">
                With {initialClass.mentor} · Paid live class
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-3">Paid live class</p>
            )}
          </div>
        </section>

        <section className="py-6 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 items-start lg:items-stretch">
              <div className="lg:col-span-7 min-w-0">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-orange-100">
                  <SeoCoverImage
                    src={initialClass.image}
                    alt={`${initialClass.title} online class`}
                    sizes="(max-width: 1024px) 100vw, 640px"
                    priority
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>

              <aside className="lg:col-span-5 min-w-0">
                <div className="h-full bg-white rounded-2xl border-2 border-orange-100 p-4 sm:p-6 flex flex-col">
                  {initialClass.mentor ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <MentorAvatar src={initialClass.mentorImage} name={initialClass.mentor} size="md" />
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Mentor</p>
                        <p className="font-semibold text-sm text-gray-900 truncate">{initialClass.mentor}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-bold uppercase tracking-wide text-educture-orange">
                      Paid live class
                    </p>
                  )}

                  <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 text-left">
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-wide text-gray-500">Duration</dt>
                      <dd className="mt-0.5 text-xs font-semibold text-gray-900 leading-snug break-words">
                        {initialClass.duration || '1 / 3 / 6 month plans'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-wide text-gray-500">Sessions</dt>
                      <dd className="mt-0.5 text-xs font-semibold text-gray-900 leading-snug break-words">
                        {initialClass.sessions || 'Live on Google Meet'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-wide text-gray-500">Format</dt>
                      <dd className="mt-0.5 text-xs font-semibold text-gray-900 leading-snug">Live peer class</dd>
                    </div>
                  </dl>

                  <p className="text-sm font-semibold text-[#1a1a1a] mt-4">Plans</p>
                  <ul className="mt-2 space-y-2">
                    {coursePlanBlueprintOrder.map((tier) => {
                      const blueprint = coursePlanBlueprints[tier]
                      const amount = getPaymentAmount(
                        { categoryId: initialClass.categoryId, tier },
                        pricing,
                      )
                      return (
                        <li
                          key={tier}
                          className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-[#fff9f3] px-3 py-2.5"
                        >
                          <span className="text-sm text-gray-700">{blueprint.durationLabel}</span>
                          <span className="text-sm font-semibold text-[#1a1a1a]">{formatInr(amount)}</span>
                        </li>
                      )
                    })}
                  </ul>

                  <button
                    type="button"
                    onClick={handleEnroll}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-educture-orange px-4 py-3 text-sm font-semibold text-white hover:bg-educture-orange-dark transition-colors"
                  >
                    {isSignedIn ? 'View & enroll' : 'Join to take this class'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to="/classes"
                    className="mt-3 inline-flex w-full items-center justify-center text-sm font-semibold text-educture-orange hover:underline"
                  >
                    Browse all online classes
                  </Link>
                  <Link
                    to="/counselling"
                    className="mt-2 inline-flex w-full items-center justify-center text-sm font-semibold text-gray-600 hover:text-educture-orange"
                  >
                    Need career counselling first?
                  </Link>
                </div>
              </aside>
            </div>

            <div className="text-left min-w-0">
              <h2 className="font-display text-xl text-[#1a1a1a]">About this class</h2>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap break-words max-w-3xl">
                {description}
              </p>
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-xl text-[#1a1a1a]">What you’ll learn</h2>
              <p className="text-sm text-gray-600 mt-1">
                Topics covered in the 1, 3, and 6 month plans.
              </p>
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
                {coursePlanBlueprintOrder.map((tier) => {
                  const blueprint = coursePlanBlueprints[tier]
                  const amount = getPaymentAmount(
                    { categoryId: initialClass.categoryId, tier },
                    pricing,
                  )
                  return (
                    <article
                      key={tier}
                      className={`rounded-2xl border-2 p-4 sm:p-5 text-left flex flex-col min-w-0 ${planCardClass[tier]}`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide sm:tracking-[0.16em] text-educture-orange break-words">
                        {blueprint.type}
                      </p>
                      <h3 className="font-display text-lg text-[#1a1a1a] mt-1">{blueprint.name}</h3>
                      <p className="font-display text-2xl text-[#1a1a1a] mt-2">{formatInr(amount)}</p>
                      <p className="text-xs font-semibold text-educture-orange mt-0.5">
                        {blueprint.durationLabel}
                      </p>
                      <ul className="mt-4 space-y-2 flex-1">
                        {blueprint.syllabusDepth.map((topic) => (
                          <li key={topic} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-educture-orange shrink-0 mt-0.5" />
                            <span className="min-w-0 break-words">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  )
                })}
              </div>
            </div>

            {relatedClasses.length > 0 ? (
              <div className="pb-4 min-w-0">
                <h2 className="font-display text-xl text-[#1a1a1a]">Related online classes</h2>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relatedClasses.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={classPublicPath(item)}
                        className="block rounded-2xl border-2 border-orange-100 bg-white p-4 hover:border-educture-orange/50"
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-educture-orange">
                          {getCategoryById(item.categoryId)?.title ?? item.categoryId}
                        </p>
                        <p className="font-semibold text-sm text-[#1a1a1a] mt-1 break-words">{item.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

'use client'

import { useAuth } from '@clerk/nextjs'
import { ArrowLeft, ArrowRight, Clock, Users, Video } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { MentorAvatar } from '../components/ui/MentorAvatar'
import { formatBrowsePricingSummary, getCategoryById } from '../data/classCatalog'
import { SeoCoverImage } from '../components/seo/SeoCoverImage'
import { classPublicPath } from '../lib/classSlug'
import { classPublicDescription } from '../lib/seo'
import type { PublishedClass } from '../lib/publishedClasses'

const AUTH_RETURN_KEY = 'educture_auth_return'

export function PublicClassDetailPage({
  initialClass,
  relatedClasses = [],
}: {
  initialClass: PublishedClass
  relatedClasses?: PublishedClass[]
}) {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const category = getCategoryById(initialClass.categoryId)
  const pricingLine = formatBrowsePricingSummary()

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
    <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
      <MainNavbar />

      <main className="flex-1">
        <section className="bg-[#0f0f12] text-white border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left">
            <Link
              to="/classes"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              All online classes
            </Link>
            <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 mt-5">
              <Video className="w-4 h-4" />
              {category?.title ?? 'Live peer session'}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl mt-2 leading-tight">
              {initialClass.title}
            </h1>
            <p className="text-sm text-gray-400 mt-3 max-w-2xl leading-relaxed">
              {classPublicDescription(initialClass)} {pricingLine}.
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-orange-100">
                <SeoCoverImage
                  src={initialClass.image}
                  alt={`${initialClass.title} online class`}
                  sizes="(max-width: 1024px) 100vw, 640px"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white border border-orange-100 px-4 py-3">
                  <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-educture-orange" />
                    Duration
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {initialClass.duration || 'Shared in class'}
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-orange-100 px-4 py-3">
                  <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-educture-orange" />
                    Sessions
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {initialClass.sessions || 'Live on Google Meet'}
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-orange-100 px-4 py-3">
                  <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-educture-orange" />
                    Format
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">Live peer class</p>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="bg-white rounded-2xl border-2 border-orange-100 p-5 sm:p-6 lg:sticky lg:top-24">
                {initialClass.mentor ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <MentorAvatar src={initialClass.mentorImage} name={initialClass.mentor} size="md" />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Mentor</p>
                      <p className="font-semibold text-sm text-gray-900 truncate">{initialClass.mentor}</p>
                    </div>
                  </div>
                ) : null}
                <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                  Browsing is free. Enrol to get your session schedule and Google Meet link. {pricingLine}.
                </p>
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
          {relatedClasses.length > 0 ? (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 pb-4">
              <h2 className="font-display text-xl text-[#1a1a1a]">Related online classes</h2>
              <ul className="mt-4 grid sm:grid-cols-3 gap-3">
                {relatedClasses.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={classPublicPath(item)}
                      className="block rounded-2xl border-2 border-orange-100 bg-white p-4 hover:border-educture-orange/50"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-educture-orange">
                        {getCategoryById(item.categoryId)?.title ?? item.categoryId}
                      </p>
                      <p className="font-semibold text-sm text-[#1a1a1a] mt-1">{item.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

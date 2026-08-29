import type { Metadata } from 'next'
import Link from 'next/link'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Page not found')

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf8f0] px-4 text-center">
      <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em]">404</p>
      <h1 className="font-display text-3xl sm:text-4xl text-[#1a1a1a] mt-3">Page not found</h1>
      <p className="text-sm text-gray-600 mt-3 max-w-md">
        This page is not available. Head back to PRIZMA for career counselling, online classes, and college guidance.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-educture-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-educture-orange-dark"
        >
          Home
        </Link>
        <Link
          href="/classes"
          className="inline-flex items-center rounded-full border-2 border-orange-100 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700"
        >
          Online classes
        </Link>
        <Link
          href="/counselling"
          className="inline-flex items-center rounded-full border-2 border-orange-100 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700"
        >
          Career counselling
        </Link>
      </div>
    </div>
  )
}

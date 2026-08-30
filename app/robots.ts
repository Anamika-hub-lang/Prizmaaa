import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/sign-in',
          '/sign-up',
          '/login',
          '/signup',
          '/student',
          '/teacher',
          '/admin',
          '/counsellor',
          '/data-upload',
          '/partner',
          '/onboarding',
          '/auth',
          '/api',
          '/counselling/payment',
          '/pay',
          '/library',
          '/blog',
          '/colleges/compare',
          '/reviews',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

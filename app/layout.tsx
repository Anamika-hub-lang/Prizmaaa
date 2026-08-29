import type { Metadata } from 'next'
import { Providers } from './providers'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absUrl,
  homeDescription,
  homeTitleAbsolute,
  indexFollow,
} from '@/lib/seo'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: homeTitleAbsolute,
    template: `%s | ${SITE_NAME}`,
  },
  description: homeDescription,
  applicationName: SITE_NAME,
  keywords: [
    'PRIZMA',
    'career counselling',
    'online classes',
    'online courses',
    'student guidance',
    'college counselling India',
  ],
  robots: indexFollow,
  icons: { icon: '/prizma-logo.png' },
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [DEFAULT_OG_IMAGE],
  },
}

export const dynamic = 'force-dynamic'

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: absUrl('/prizma-logo.png'),
  description: homeDescription,
  sameAs: [SITE_URL],
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-x-hidden">
        <JsonLd data={[organizationLd, websiteLd]} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

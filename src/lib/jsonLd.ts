import { COUNSELLING_PRICE_INR } from '../data/counsellingServices'
import type { SeoFaqItem } from '../data/seoFaqs'
import { classPublicPath } from './classSlug'
import type { PublishedClass } from './publishedClasses'
import { classPublicDescription, SITE_NAME, SITE_URL, absUrl } from './seo'

export function faqJsonLd(items: SeoFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function counsellingServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Online career counselling for students',
    serviceType: 'Career counselling',
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: 'IN',
    offers: {
      '@type': 'Offer',
      price: String(COUNSELLING_PRICE_INR),
      priceCurrency: 'INR',
      url: absUrl('/counselling'),
    },
    description: `1-on-1 online career counselling and career guidance from ₹${COUNSELLING_PRICE_INR} per call on PRIZMA.`,
  }
}

export function courseJsonLd(cls: PublishedClass) {
  const url = absUrl(classPublicPath(cls))
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: cls.title,
    description: classPublicDescription(cls),
    url,
    image: cls.image || undefined,
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      url,
      category: 'Paid',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'INR',
      price: String(cls.price ?? 0),
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      location: {
        '@type': 'VirtualLocation',
        url,
      },
    },
  }
}

export function classesItemListJsonLd(classes: PublishedClass[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Online classes and live courses for students on PRIZMA',
    itemListElement: classes.slice(0, 20).map((cls, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absUrl(classPublicPath(cls)),
      name: cls.title,
    })),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  }
}

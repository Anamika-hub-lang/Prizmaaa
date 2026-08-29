import type { MetadataRoute } from 'next'
import { counsellingGroups } from '@/data/counsellingServices'
import { universities } from '@/data/universities'
import { featuredUniversities } from '@/components/marketing/university-counseling/data'
import { collegeRepository } from '@/lib/colleges'
import { fetchPublishedClasses } from '@/lib/publishedClasses'
import { SITE_URL, absUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

function entry(
  path: string,
  opts: Pick<MetadataRoute.Sitemap[number], 'changeFrequency' | 'priority' | 'lastModified'> = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: absUrl(path),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? 'weekly',
    priority: opts.priority ?? 0.7,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [colleges, publishedClasses] = await Promise.all([
    collegeRepository.getAll(),
    fetchPublishedClasses(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    entry('/', { priority: 1, changeFrequency: 'weekly' }),
    entry('/counselling', { priority: 0.95, changeFrequency: 'weekly' }),
    ...counsellingGroups.map((group) =>
      entry(`/counselling/${group.id}`, { priority: 0.9, changeFrequency: 'weekly' }),
    ),
    entry('/counselling/interview-prep', { priority: 0.85, changeFrequency: 'weekly' }),
    entry('/classes', { priority: 0.95, changeFrequency: 'weekly' }),
    entry('/university-counseling', { priority: 0.8, changeFrequency: 'weekly' }),
    ...featuredUniversities.map((uni) =>
      entry(`/university-counseling/${uni.id}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),
    entry('/colleges', { priority: 0.8, changeFrequency: 'weekly' }),
    entry('/colleges/find', { priority: 0.65, changeFrequency: 'monthly' }),
    entry('/universities', { priority: 0.75, changeFrequency: 'weekly' }),
    entry('/about', { priority: 0.6, changeFrequency: 'monthly' }),
    entry('/pricing', { priority: 0.6, changeFrequency: 'monthly' }),
    entry('/ai', { priority: 0.65, changeFrequency: 'monthly' }),
    entry('/become-mentor', { priority: 0.5, changeFrequency: 'monthly' }),
    entry('/reviews', { priority: 0.4, changeFrequency: 'monthly' }),
  ]

  const collegeRoutes = colleges.map((college) =>
    entry(`/colleges/${college.slug}`, { priority: 0.6, changeFrequency: 'monthly' }),
  )

  const universityRoutes = universities.map((uni) =>
    entry(`/universities/${uni.id}`, { priority: 0.55, changeFrequency: 'monthly' }),
  )

  const classRoutes = publishedClasses.map((cls) =>
    entry(`/classes/${cls.id}`, {
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: cls.createdAt ? new Date(cls.createdAt) : new Date(),
    }),
  )

  const seen = new Set<string>()
  const merged = [...staticRoutes, ...classRoutes, ...collegeRoutes, ...universityRoutes]
  return merged.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return item.url.startsWith(SITE_URL)
  })
}

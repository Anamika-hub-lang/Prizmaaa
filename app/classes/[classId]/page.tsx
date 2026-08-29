import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { PublicClassDetailPage } from '@/views/PublicClassDetailPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { fetchPublishedClassByParam, fetchPublishedClasses } from '@/lib/publishedClasses'
import { classPublicPath } from '@/lib/classSlug'
import { breadcrumbJsonLd, courseJsonLd } from '@/lib/jsonLd'
import { classDetailSeo } from '@/lib/seo'

type Props = { params: Promise<{ classId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params
  const cls = await fetchPublishedClassByParam(classId)
  if (!cls) notFound()
  return classDetailSeo(cls)
}

export default async function Page({ params }: Props) {
  const { classId } = await params
  const [cls, published] = await Promise.all([
    fetchPublishedClassByParam(classId),
    fetchPublishedClasses(),
  ])
  if (!cls) notFound()
  if (classId === cls.id && cls.slug !== cls.id) {
    permanentRedirect(classPublicPath(cls))
  }

  const relatedClasses = published
    .filter((item) => item.id !== cls.id && item.categoryId === cls.categoryId)
    .slice(0, 3)

  return (
    <>
      <JsonLd
        data={[
          courseJsonLd(cls),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Online classes', path: '/classes' },
            { name: cls.title, path: classPublicPath(cls) },
          ]),
        ]}
      />
      <PublicClassDetailPage initialClass={cls} relatedClasses={relatedClasses} />
    </>
  )
}

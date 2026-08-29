import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicClassDetailPage } from '@/views/PublicClassDetailPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { fetchPublishedClassById } from '@/lib/publishedClasses'
import { breadcrumbJsonLd, courseJsonLd } from '@/lib/jsonLd'
import { classDetailSeo } from '@/lib/seo'

type Props = { params: Promise<{ classId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params
  const cls = await fetchPublishedClassById(classId)
  if (!cls) notFound()
  return classDetailSeo(cls)
}

export default async function Page({ params }: Props) {
  const { classId } = await params
  const cls = await fetchPublishedClassById(classId)
  if (!cls) notFound()

  return (
    <>
      <JsonLd
        data={[
          courseJsonLd(cls),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Online classes', path: '/classes' },
            { name: cls.title, path: `/classes/${cls.id}` },
          ]),
        ]}
      />
      <PublicClassDetailPage initialClass={cls} />
    </>
  )
}

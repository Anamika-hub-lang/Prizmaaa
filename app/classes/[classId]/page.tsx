import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicClassDetailPage } from '@/views/PublicClassDetailPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { fetchPublishedClassById } from '@/lib/publishedClasses'
import { SITE_NAME, SITE_URL, absUrl, classDetailSeo } from '@/lib/seo'

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
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: cls.title,
          description: cls.description || `${cls.title} live online class on ${SITE_NAME}`,
          provider: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
          },
          url: absUrl(`/classes/${cls.id}`),
          image: cls.image || undefined,
        }}
      />
      <PublicClassDetailPage initialClass={cls} />
    </>
  )
}
